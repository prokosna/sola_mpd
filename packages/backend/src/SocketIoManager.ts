import {
	CONFIG_KEY_BROWSER_STATE,
	CONFIG_KEY_COMMON_SONG_TABLE_STATE,
	CONFIG_KEY_MPD_PROFILE_STATE,
	CONFIG_KEY_PLUGIN_STATE,
	CONFIG_KEY_RECENTLY_ADDED_STATE,
	CONFIG_KEY_SAVED_SEARCHES,
	SOCKETIO_ADVANCED_SEARCH,
	SOCKETIO_CONFIG_CHANGED,
	SOCKETIO_CONFIG_FETCH,
	SOCKETIO_CONFIG_SAVE,
	SOCKETIO_MPD_COMMAND,
	SOCKETIO_MPD_COMMAND_BULK,
	SOCKETIO_MPD_SUBSCRIBE,
	SOCKETIO_MPD_UNSUBSCRIBE,
	SOCKETIO_PLUGIN_EXECUTE,
	SOCKETIO_PLUGIN_REGISTER,
	SOCKETIO_VIEW_STATE_BLOB_FETCH,
	SOCKETIO_VIEW_STATE_BLOB_SAVE,
} from "@sola_mpd/shared/src/const/socketio.js";
import type { Server as IOServer } from "socket.io";
import type { AdvancedSearchMessageHandler } from "./advanced_search/transports/AdvancedSearchMessageHandler.js";
import { AdvancedSearchMessageHandlerSocketIo } from "./advanced_search/transports/AdvancedSearchMessageHandlerSocketIo.js";
import type { ConfigMessageHandler } from "./configs/transports/ConfigMessageHandler.js";
import { ConfigMessageHandlerSocketIo } from "./configs/transports/ConfigMessageHandlerSocketIo.js";
import type { MpdMessageHandler } from "./mpd/transports/MpdMessageHandler.js";
import { MpdMessageHandlerSocketIo } from "./mpd/transports/MpdMessageHandlerSocketIo.js";
import type { PluginMessageHandler } from "./plugins/transports/PluginMessageHandler.js";
import { PluginMessageHandlerSocketIo } from "./plugins/transports/PluginMessageHandlerSocketIo.js";
import {
	createAdvancedSearchErrorBuffer,
	createMpdErrorBuffer,
	createPluginRegisterErrorBuffer,
} from "./utils/errorBufferUtils.js";
import type { ViewStateBlobMessageHandler } from "./view_state_blobs/transports/ViewStateBlobMessageHandler.js";
import { ViewStateBlobMessageHandlerSocketIo } from "./view_state_blobs/transports/ViewStateBlobMessageHandlerSocketIo.js";

export class SocketIoManager {
	private constructor(_io: IOServer) {}

	static initialize(io: IOServer): SocketIoManager {
		console.info("Socket.io is initializing...");
		const socketIoManager = new SocketIoManager(io);

		const mpdHandler: MpdMessageHandler =
			MpdMessageHandlerSocketIo.initialize(io);
		const pluginHandler: PluginMessageHandler =
			new PluginMessageHandlerSocketIo();
		const advancedSearchHandler: AdvancedSearchMessageHandler =
			AdvancedSearchMessageHandlerSocketIo.initialize();
		const configHandler: ConfigMessageHandler =
			new ConfigMessageHandlerSocketIo();
		const viewStateBlobHandler: ViewStateBlobMessageHandler =
			new ViewStateBlobMessageHandlerSocketIo();

		const configKeys = [
			CONFIG_KEY_BROWSER_STATE,
			CONFIG_KEY_COMMON_SONG_TABLE_STATE,
			CONFIG_KEY_MPD_PROFILE_STATE,
			CONFIG_KEY_PLUGIN_STATE,
			CONFIG_KEY_SAVED_SEARCHES,
			CONFIG_KEY_RECENTLY_ADDED_STATE,
		];

		io.on("connection", (socket) => {
			const id = socket.id;
			console.info(`Socket.io is connected: ${id}`);

			socket.on(SOCKETIO_MPD_SUBSCRIBE, async (msg: ArrayBuffer, callback) => {
				try {
					await mpdHandler.subscribeEvents(id, new Uint8Array(msg), socket);
					callback();
				} catch (err) {
					console.error(err);
					callback(Buffer.from(createMpdErrorBuffer(err)));
				}
			});

			socket.on(
				SOCKETIO_MPD_UNSUBSCRIBE,
				async (msg: ArrayBuffer, callback) => {
					try {
						await mpdHandler.unsubscribeEvents(id, new Uint8Array(msg), socket);
						callback();
					} catch (err) {
						console.error(err);
						callback(Buffer.from(createMpdErrorBuffer(err)));
					}
				},
			);

			socket.on(SOCKETIO_MPD_COMMAND, async (msg: ArrayBuffer, callback) => {
				try {
					const res = await mpdHandler.command(new Uint8Array(msg));
					callback(Buffer.from(res));
				} catch (err) {
					console.error(err);
					callback(Buffer.from(createMpdErrorBuffer(err)));
				}
			});

			socket.on(
				SOCKETIO_MPD_COMMAND_BULK,
				async (msg: ArrayBuffer, callback) => {
					try {
						await mpdHandler.commandBulk(new Uint8Array(msg));
						callback();
					} catch (err) {
						console.error(err);
						callback(Buffer.from(createMpdErrorBuffer(err)));
					}
				},
			);

			socket.on(
				SOCKETIO_PLUGIN_REGISTER,
				async (msg: ArrayBuffer, callback) => {
					try {
						const resp = await pluginHandler.register(new Uint8Array(msg));
						callback(Buffer.from(resp));
					} catch (err) {
						console.error(err);
						callback(Buffer.from(createPluginRegisterErrorBuffer(err)));
					}
				},
			);

			// ACK on receipt, not completion: results stream via separate events
			// and execution may outlast the client's ACK timeout.
			socket.on(SOCKETIO_PLUGIN_EXECUTE, async (msg: ArrayBuffer, callback) => {
				callback();
				try {
					for await (const [callbackEvent, resp] of pluginHandler.execute(
						new Uint8Array(msg),
					)) {
						socket.emit(callbackEvent, resp);
					}
				} catch (err) {
					console.error(err);
				}
			});

			socket.on(
				SOCKETIO_ADVANCED_SEARCH,
				async (msg: ArrayBuffer, callback) => {
					try {
						const resp = await advancedSearchHandler.command(
							new Uint8Array(msg),
						);
						callback(Buffer.from(resp));
					} catch (err) {
						console.error(err);
						callback(Buffer.from(createAdvancedSearchErrorBuffer(err)));
					}
				},
			);

			for (const key of configKeys) {
				socket.on(
					`${SOCKETIO_CONFIG_FETCH}_${key}`,
					(_msg: ArrayBuffer, callback) => {
						try {
							const data = configHandler.fetch(key);
							callback(data);
						} catch (err) {
							console.error(err);
							callback(Buffer.alloc(0));
						}
					},
				);

				socket.on(
					`${SOCKETIO_CONFIG_SAVE}_${key}`,
					(msg: ArrayBuffer, callback) => {
						try {
							configHandler.save(key, Buffer.from(new Uint8Array(msg)));
						} catch (err) {
							console.error(err);
							callback();
							return;
						}
						// Ack the sender first: it already holds the new value, and a
						// broadcast failure below must not turn a successful save into
						// a failed one from the caller's perspective.
						callback();
						try {
							// "Except sender" broadcast: the saving client already has the
							// new value locally, so echoing back to it would trigger a
							// pointless refetch that can race with its own local update.
							socket.broadcast.emit(
								SOCKETIO_CONFIG_CHANGED,
								Buffer.from(key, "utf-8"),
							);
						} catch (err) {
							console.error(err);
						}
					},
				);
			}

			// View state blob save (request-response): payload is the blob text,
			// response is the token text.
			socket.on(SOCKETIO_VIEW_STATE_BLOB_SAVE, (msg: ArrayBuffer, callback) => {
				try {
					const data = Buffer.from(new Uint8Array(msg)).toString("utf-8");
					const token = viewStateBlobHandler.save(data);
					callback(Buffer.from(token, "utf-8"));
				} catch (err) {
					console.error(err);
					callback(Buffer.alloc(0));
				}
			});

			// View state blob fetch (request-response): payload is the token text,
			// response is the blob text, or an empty buffer when the token is
			// unknown (blob tokens always resolve to non-empty text, so this is
			// unambiguous).
			socket.on(
				SOCKETIO_VIEW_STATE_BLOB_FETCH,
				(msg: ArrayBuffer, callback) => {
					try {
						const token = Buffer.from(new Uint8Array(msg)).toString("utf-8");
						const data = viewStateBlobHandler.fetch(token);
						callback(
							data === undefined ? Buffer.alloc(0) : Buffer.from(data, "utf-8"),
						);
					} catch (err) {
						console.error(err);
						callback(Buffer.alloc(0));
					}
				},
			);

			socket.on("disconnect", async () => {
				try {
					await mpdHandler.disconnect(id, socket);
				} catch (err) {
					console.error(err);
				}
			});
		});

		return socketIoManager;
	}
}
