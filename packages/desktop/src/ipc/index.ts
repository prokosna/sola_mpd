import { fromBinary, toBinary } from "@bufbuild/protobuf";
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
} from "@sola_mpd/shared/src/const/socketio.js";
import { MpdEventSchema } from "@sola_mpd/shared/src/models/mpd/mpd_event_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
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

let currentWindow: BrowserWindow | undefined;
let handlersRegistered = false;

const idEventHandlerMap = new DeepMap<
	[string, MpdProfile],
	Promise<MpdSubscriptionHandler>
>();

function getWindow(): BrowserWindow | undefined {
	if (currentWindow !== undefined && !currentWindow.isDestroyed()) {
		return currentWindow;
	}
	return undefined;
}

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

	// MPD subscribe
	ipcMain.handle(
		SOCKETIO_MPD_SUBSCRIBE,
		async (_event, msg: Uint8Array): Promise<Uint8Array> => {
			try {
				const targetProfile = fromBinary(MpdProfileSchema, msg);
				if (idEventHandlerMap.has([CLIENT_ID, targetProfile])) {
					return new Uint8Array(0);
				}

				const { profile, handlerPromise } = await subscribeMpdEventsUseCase({
					msg,
					onEvent: (event) => {
						const win = getWindow();
						if (win !== undefined) {
							win.webContents.send(
								SOCKETIO_MPD_EVENT,
								toBinary(MpdEventSchema, event),
							);
						}
					},
					mpdClient: mpdClientMpd3,
				});

				idEventHandlerMap.set([CLIENT_ID, profile], handlerPromise);
				await handlerPromise;
				const room = `${profile.host}:${profile.port}`;
				console.info(`Desktop client subscribed to ${room}`);
			} catch (err) {
				console.error(err);
			}
			return new Uint8Array(0);
		},
	);

	// MPD unsubscribe
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
			} catch (err) {
				console.error(err);
			}
			return new Uint8Array(0);
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

	// Plugin execute (streaming via dynamic callback events)
	ipcMain.handle(
		SOCKETIO_PLUGIN_EXECUTE,
		async (_event, msg: Uint8Array): Promise<Uint8Array> => {
			try {
				for await (const [callbackEvent, resp] of executePluginUseCase(
					msg,
					pluginClientConnect,
				)) {
					const win = getWindow();
					if (win !== undefined) {
						win.webContents.send(callbackEvent, resp);
					}
				}
			} catch (err) {
				console.error(err);
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

	// Config state fetch/save
	for (const key of configKeys) {
		ipcMain.handle(`${SOCKETIO_CONFIG_FETCH}_${key}`, (): Uint8Array => {
			try {
				const data = readUseCases[key]();
				return new Uint8Array(data);
			} catch (err) {
				console.error(err);
				return new Uint8Array(0);
			}
		});

		ipcMain.handle(
			`${SOCKETIO_CONFIG_SAVE}_${key}`,
			(_event, msg: Uint8Array): Uint8Array => {
				try {
					writeUseCases[key](Buffer.from(msg));
				} catch (err) {
					console.error(err);
				}
				return new Uint8Array(0);
			},
		);
	}
}

export function initializeIpcManager(mainWindow: BrowserWindow): void {
	currentWindow = mainWindow;

	if (!handlersRegistered) {
		registerIpcHandlers();
		handlersRegistered = true;
	}

	mainWindow.on("closed", async () => {
		currentWindow = undefined;
		await cleanupSubscriptions();
	});
}
