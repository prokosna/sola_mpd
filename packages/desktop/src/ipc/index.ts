import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import {
	CONFIG_KEY_BROWSER_STATE,
	CONFIG_KEY_COMMON_SONG_TABLE_STATE,
	CONFIG_KEY_MPD_PROFILE_STATE,
	CONFIG_KEY_PLUGIN_STATE,
	CONFIG_KEY_RECENTLY_ADDED_STATE,
	CONFIG_KEY_SAVED_SEARCHES,
	SOCKETIO_ADVANCED_SEARCH,
	SOCKETIO_CONFIG_FETCH,
	SOCKETIO_CONFIG_SAVE,
	SOCKETIO_MPD_COMMAND,
	SOCKETIO_MPD_COMMAND_BULK,
	SOCKETIO_MPD_EVENT,
	SOCKETIO_MPD_SUBSCRIBE,
	SOCKETIO_MPD_UNSUBSCRIBE,
	SOCKETIO_PLUGIN_EXECUTE,
	SOCKETIO_PLUGIN_REGISTER,
	SOCKETIO_VIEW_STATE_BLOB_FETCH,
	SOCKETIO_VIEW_STATE_BLOB_SAVE,
} from "@sola_mpd/shared/src/const/socketio.js";
import { MpdEventSchema } from "@sola_mpd/shared/src/models/mpd/mpd_event_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { PluginExecuteResponseWrapperSchema } from "@sola_mpd/shared/src/models/plugin/plugin_wrapper_pb.js";
import { DeepMap } from "@sola_mpd/shared/src/utils/DeepMap.js";
import type { BrowserWindow } from "electron";
import { ipcMain } from "electron";
import { executeAdvancedSearchCommandUseCase } from "#backend/advanced_search/application/advancedSearchUseCases.js";
import { advancedSearchApiHttp } from "#backend/advanced_search/services/AdvancedSearchApiHttp.js";
import {
	readBrowserState,
	readCommonSongTableState,
	readMpdProfileState,
	readPluginState,
	readRecentlyAddedState,
	readSavedSearches,
	updateBrowserState,
	updateCommonSongTableState,
	updateMpdProfileState,
	updatePluginState,
	updateRecentlyAddedState,
	updateSavedSearches,
} from "#backend/configs/application/configStateUseCases.js";
import {
	disconnectMpdEventsUseCase,
	executeMpdCommandBulkUseCase,
	executeMpdCommandUseCase,
	subscribeMpdEventsUseCase,
	unsubscribeMpdEventsUseCase,
} from "#backend/mpd/application/mpdUseCases.js";
import type { MpdSubscriptionHandler } from "#backend/mpd/services/MpdClient.js";
import { mpdClientMpd3 } from "#backend/mpd/services/MpdClientMpd3.js";
import {
	executePluginUseCase,
	registerPluginUseCase,
} from "#backend/plugins/application/pluginUseCases.js";
import { pluginClientConnect } from "#backend/plugins/services/PluginClientConnect.js";
import {
	createAdvancedSearchErrorBuffer,
	createMpdErrorBuffer,
	createPluginRegisterErrorBuffer,
} from "#backend/utils/errorBufferUtils.js";
import {
	readViewStateBlobUseCase,
	saveViewStateBlobUseCase,
} from "#backend/view_state_blobs/application/viewStateBlobUseCases.js";

const CLIENT_ID = "desktop";

const configKeys = [
	CONFIG_KEY_BROWSER_STATE,
	CONFIG_KEY_COMMON_SONG_TABLE_STATE,
	CONFIG_KEY_MPD_PROFILE_STATE,
	CONFIG_KEY_PLUGIN_STATE,
	CONFIG_KEY_SAVED_SEARCHES,
	CONFIG_KEY_RECENTLY_ADDED_STATE,
];

const readUseCases: Record<string, () => Buffer> = {
	[CONFIG_KEY_BROWSER_STATE]: readBrowserState,
	[CONFIG_KEY_COMMON_SONG_TABLE_STATE]: readCommonSongTableState,
	[CONFIG_KEY_MPD_PROFILE_STATE]: readMpdProfileState,
	[CONFIG_KEY_PLUGIN_STATE]: readPluginState,
	[CONFIG_KEY_SAVED_SEARCHES]: readSavedSearches,
	[CONFIG_KEY_RECENTLY_ADDED_STATE]: readRecentlyAddedState,
};

const writeUseCases: Record<string, (data: Buffer) => void> = {
	[CONFIG_KEY_BROWSER_STATE]: updateBrowserState,
	[CONFIG_KEY_COMMON_SONG_TABLE_STATE]: updateCommonSongTableState,
	[CONFIG_KEY_MPD_PROFILE_STATE]: updateMpdProfileState,
	[CONFIG_KEY_PLUGIN_STATE]: updatePluginState,
	[CONFIG_KEY_SAVED_SEARCHES]: updateSavedSearches,
	[CONFIG_KEY_RECENTLY_ADDED_STATE]: updateRecentlyAddedState,
};

let handlersRegistered = false;

const idEventHandlerMap = new DeepMap<
	[string, MpdProfile],
	Promise<MpdSubscriptionHandler>
>();

async function cleanupSubscriptions(): Promise<void> {
	for (const [key, handlerPromise] of idEventHandlerMap) {
		const [, profile] = key;
		try {
			await disconnectMpdEventsUseCase({
				profile,
				handlerPromise,
				mpdClient: mpdClientMpd3,
			});
		} catch (err) {
			console.error(err);
		}
	}
	idEventHandlerMap.clear();
}

function registerIpcHandlers(): void {
	// MPD command (request-response)
	ipcMain.handle(
		SOCKETIO_MPD_COMMAND,
		async (_event, msg: Uint8Array): Promise<Uint8Array> => {
			try {
				return await executeMpdCommandUseCase(msg, mpdClientMpd3);
			} catch (err) {
				console.error(err);
				return createMpdErrorBuffer(err);
			}
		},
	);

	// MPD command bulk (request-response)
	ipcMain.handle(
		SOCKETIO_MPD_COMMAND_BULK,
		async (_event, msg: Uint8Array): Promise<Uint8Array> => {
			try {
				await executeMpdCommandBulkUseCase(msg, mpdClientMpd3);
				return new Uint8Array(0);
			} catch (err) {
				console.error(err);
				return createMpdErrorBuffer(err);
			}
		},
	);

	ipcMain.handle(
		SOCKETIO_MPD_SUBSCRIBE,
		async (event, msg: Uint8Array): Promise<Uint8Array> => {
			try {
				const targetProfile = fromBinary(MpdProfileSchema, msg);
				if (idEventHandlerMap.has([CLIENT_ID, targetProfile])) {
					return new Uint8Array(0);
				}

				const sender = event.sender;
				const { profile, handlerPromise } = await subscribeMpdEventsUseCase({
					msg,
					onEvent: (event) => {
						if (!sender.isDestroyed()) {
							sender.send(SOCKETIO_MPD_EVENT, toBinary(MpdEventSchema, event));
						}
					},
					mpdClient: mpdClientMpd3,
				});

				idEventHandlerMap.set([CLIENT_ID, profile], handlerPromise);
				await handlerPromise;
				const room = `${profile.host}:${profile.port}`;
				console.info(`Desktop client subscribed to ${room}`);
				return new Uint8Array(0);
			} catch (err) {
				console.error(err);
				return createMpdErrorBuffer(err);
			}
		},
	);

	ipcMain.handle(
		SOCKETIO_MPD_UNSUBSCRIBE,
		async (_event, msg: Uint8Array): Promise<Uint8Array> => {
			try {
				const profile = fromBinary(MpdProfileSchema, msg);
				const handlerPromise = idEventHandlerMap.get([CLIENT_ID, profile]);
				if (handlerPromise === undefined) {
					return new Uint8Array(0);
				}

				const unsubscribedProfile = await unsubscribeMpdEventsUseCase({
					msg,
					handlerPromise,
					mpdClient: mpdClientMpd3,
				});
				if (unsubscribedProfile !== undefined) {
					idEventHandlerMap.delete([CLIENT_ID, unsubscribedProfile]);
					const room = `${unsubscribedProfile.host}:${unsubscribedProfile.port}`;
					console.info(`Desktop client unsubscribed from ${room}`);
				}
				return new Uint8Array(0);
			} catch (err) {
				console.error(err);
				return createMpdErrorBuffer(err);
			}
		},
	);

	// Plugin register (request-response)
	ipcMain.handle(
		SOCKETIO_PLUGIN_REGISTER,
		async (_event, msg: Uint8Array): Promise<Uint8Array> => {
			try {
				return await registerPluginUseCase(msg, pluginClientConnect);
			} catch (err) {
				console.error(err);
				return createPluginRegisterErrorBuffer(err);
			}
		},
	);

	// Plugin execute (streaming via dynamic callback events).
	// The invoke return value is unused — responses (including errors) reach the
	// caller via the dynamic callback event pushed to the invoking renderer.
	ipcMain.handle(
		SOCKETIO_PLUGIN_EXECUTE,
		async (event, msg: Uint8Array): Promise<Uint8Array> => {
			const sender = event.sender;
			let lastCallbackEvent: string | undefined;
			try {
				for await (const [callbackEvent, resp] of executePluginUseCase(
					msg,
					pluginClientConnect,
				)) {
					lastCallbackEvent = callbackEvent;
					if (!sender.isDestroyed()) {
						sender.send(callbackEvent, resp);
					}
				}
			} catch (err) {
				console.error(err);
				if (lastCallbackEvent !== undefined && !sender.isDestroyed()) {
					const errorWrapper = create(PluginExecuteResponseWrapperSchema, {
						result: {
							case: "error",
							value: err instanceof Error ? err.message : String(err),
						},
					});
					sender.send(
						lastCallbackEvent,
						toBinary(PluginExecuteResponseWrapperSchema, errorWrapper),
					);
				}
			}
			return new Uint8Array(0);
		},
	);

	// Advanced search (request-response)
	ipcMain.handle(
		SOCKETIO_ADVANCED_SEARCH,
		async (_event, msg: Uint8Array): Promise<Uint8Array> => {
			try {
				return await executeAdvancedSearchCommandUseCase(
					msg,
					advancedSearchApiHttp,
					mpdClientMpd3,
				);
			} catch (err) {
				console.error(err);
				return createAdvancedSearchErrorBuffer(err);
			}
		},
	);

	// Config state fetch/save. Failures rethrow so ipcRenderer.invoke rejects
	// in the renderer instead of receiving an indistinguishable empty success.
	for (const key of configKeys) {
		ipcMain.handle(`${SOCKETIO_CONFIG_FETCH}_${key}`, (): Uint8Array => {
			try {
				const data = readUseCases[key]();
				return new Uint8Array(data);
			} catch (err) {
				console.error(err);
				throw err;
			}
		});

		ipcMain.handle(
			`${SOCKETIO_CONFIG_SAVE}_${key}`,
			(_event, msg: Uint8Array): Uint8Array => {
				try {
					writeUseCases[key](Buffer.from(msg));
					return new Uint8Array(0);
				} catch (err) {
					console.error(err);
					throw err;
				}
			},
		);
	}

	// View state blob save (request-response): payload is the blob text,
	// response is the token text.
	ipcMain.handle(
		SOCKETIO_VIEW_STATE_BLOB_SAVE,
		(_event, msg: Uint8Array): Uint8Array => {
			try {
				const data = Buffer.from(msg).toString("utf-8");
				const token = saveViewStateBlobUseCase(data);
				return new Uint8Array(Buffer.from(token, "utf-8"));
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
	);

	// View state blob fetch (request-response): payload is the token text,
	// response is the blob text, or an empty buffer when the token is unknown
	// (mirrors the SocketIoManager convention: blob tokens always resolve to
	// non-empty text, so this is unambiguous).
	ipcMain.handle(
		SOCKETIO_VIEW_STATE_BLOB_FETCH,
		(_event, msg: Uint8Array): Uint8Array => {
			try {
				const token = Buffer.from(msg).toString("utf-8");
				const data = readViewStateBlobUseCase(token);
				return data === undefined
					? new Uint8Array(0)
					: new Uint8Array(Buffer.from(data, "utf-8"));
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
	);
}

export function initializeIpcManager(mainWindow: BrowserWindow): void {
	if (!handlersRegistered) {
		registerIpcHandlers();
		handlersRegistered = true;
	}

	mainWindow.on("closed", async () => {
		await cleanupSubscriptions();
	});
}
