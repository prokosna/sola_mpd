import { create, toBinary } from "@bufbuild/protobuf";
import {
	SOCKETIO_ADVANCED_SEARCH,
	SOCKETIO_MPD_COMMAND,
	SOCKETIO_MPD_COMMAND_BULK,
	SOCKETIO_MPD_SUBSCRIBE,
	SOCKETIO_MPD_UNSUBSCRIBE,
	SOCKETIO_PLUGIN_EXECUTE,
	SOCKETIO_PLUGIN_REGISTER,
} from "@sola_mpd/shared/src/const/socketio.js";
import { AdvancedSearchResponseSchema } from "@sola_mpd/shared/src/models/advanced_search_pb.js";
import { MpdResponseSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { PluginRegisterResponseWrapperSchema } from "@sola_mpd/shared/src/models/plugin/plugin_wrapper_pb.js";
import type { Server as IOServer } from "socket.io";
import type { AdvancedSearchMessageHandler } from "./advanced_search/transports/AdvancedSearchMessageHandler.js";
import { AdvancedSearchMessageHandlerSocketIo } from "./advanced_search/transports/AdvancedSearchMessageHandlerSocketIo.js";
import type { MpdMessageHandler } from "./mpd/transports/MpdMessageHandler.js";
import { MpdMessageHandlerSocketIo } from "./mpd/transports/MpdMessageHandlerSocketIo.js";
import type { PluginMessageHandler } from "./plugins/transports/PluginMessageHandler.js";
import { PluginMessageHandlerSocketIo } from "./plugins/transports/PluginMessageHandlerSocketIo.js";
import { toErrorMessage } from "./utils/errorUtils.js";

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

		io.on("connection", (socket) => {
			const id = socket.id;
			console.info(`Socket.io is connected: ${id}`);

			// Subscribe MPD events for the given profile.
			socket.on(SOCKETIO_MPD_SUBSCRIBE, async (msg: ArrayBuffer) => {
				try {
					await mpdHandler.subscribeEvents(id, new Uint8Array(msg), socket);
				} catch (err) {
					console.error(err);
				}
			});

			// Unsubscribe MPD events for the given profile.
			socket.on(SOCKETIO_MPD_UNSUBSCRIBE, async (msg: ArrayBuffer) => {
				try {
					await mpdHandler.unsubscribeEvents(id, new Uint8Array(msg), socket);
				} catch (err) {
					console.error(err);
				}
			});

			// Execute the given command.
			socket.on(SOCKETIO_MPD_COMMAND, async (msg: ArrayBuffer, callback) => {
				try {
					const res = await mpdHandler.command(new Uint8Array(msg));
					callback(Buffer.from(res));
				} catch (err) {
					console.error(err);
					callback(createMpdErrorBuffer(err));
				}
			});

			// Execute the given commands in bulk.
			socket.on(
				SOCKETIO_MPD_COMMAND_BULK,
				async (msg: ArrayBuffer, callback) => {
					try {
						await mpdHandler.commandBulk(new Uint8Array(msg));
						callback();
					} catch (err) {
						console.error(err);
						callback(createMpdErrorBuffer(err));
					}
				},
			);

			// Register a plugin.
			socket.on(
				SOCKETIO_PLUGIN_REGISTER,
				async (msg: ArrayBuffer, callback) => {
					try {
						const resp = await pluginHandler.register(new Uint8Array(msg));
						callback(Buffer.from(resp));
					} catch (err) {
						console.error(err);
						callback(createPluginRegisterErrorBuffer(err));
					}
				},
			);

			// Execute a plugin command.
			socket.on(SOCKETIO_PLUGIN_EXECUTE, async (msg: ArrayBuffer) => {
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

			// Execute an advanced search command.
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
						callback(createAdvancedSearchErrorBuffer(err));
					}
				},
			);

			// Disconnect.
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

const createMpdErrorBuffer = (err: unknown): Buffer => {
	return Buffer.from(
		toBinary(
			MpdResponseSchema,
			create(MpdResponseSchema, {
				command: {
					case: "error",
					value: { message: toErrorMessage(err) },
				},
			}),
		),
	);
};

const createPluginRegisterErrorBuffer = (err: unknown): Buffer => {
	return Buffer.from(
		toBinary(
			PluginRegisterResponseWrapperSchema,
			create(PluginRegisterResponseWrapperSchema, {
				result: {
					case: "error",
					value: toErrorMessage(err),
				},
			}),
		),
	);
};

const createAdvancedSearchErrorBuffer = (err: unknown): Buffer => {
	return Buffer.from(
		toBinary(
			AdvancedSearchResponseSchema,
			create(AdvancedSearchResponseSchema, {
				command: {
					case: "error",
					value: toErrorMessage(err),
				},
			}),
		),
	);
};
