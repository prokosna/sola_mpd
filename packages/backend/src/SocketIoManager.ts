import {
	SIO_MPD_COMMAND,
	SIO_MPD_COMMAND_BULK,
	SIO_MPD_SUBSCRIBE,
	SIO_MPD_UNSUBSCRIBE,
	SIO_PLUGIN_EXECUTE,
	SIO_PLUGIN_REGISTER,
} from "@sola_mpd/domain/src/const/socketio.js";
import { MpdResponse } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import type { Server as IOServer } from "socket.io";

import { MpdMessageHandler } from "./mpd/MpdMessageHandler.js";
import { PluginMessageHandler } from "./plugins/PluginMessageHandler.js";

export class SocketIoManager {
	private constructor(private io: IOServer) {}

	static initialize(io: IOServer): SocketIoManager {
		console.info("Socket.io is initializing...");
		const socketIoManager = new SocketIoManager(io);

		const mpdHandler = MpdMessageHandler.initialize(io);
		const pluginHandler = new PluginMessageHandler();

		io.on("connection", (socket) => {
			const id = socket.id;
			console.info(`Socket.io is connected: ${id}`);

			// Subscribe MPD events for the given profile.
			socket.on(SIO_MPD_SUBSCRIBE, async (msg: ArrayBuffer) => {
				try {
					await mpdHandler.subscribeEvents(id, new Uint8Array(msg), socket);
				} catch (err) {
					console.error(err);
				}
			});

			// Unsubscribe MPD events for the given profile.
			socket.on(SIO_MPD_UNSUBSCRIBE, async (msg: ArrayBuffer) => {
				try {
					await mpdHandler.unsubscribeEvents(id, new Uint8Array(msg), socket);
				} catch (err) {
					console.error(err);
				}
			});

			// Execute the given command.
			socket.on(SIO_MPD_COMMAND, async (msg: ArrayBuffer, callback) => {
				try {
					const res = await mpdHandler.command(new Uint8Array(msg));
					callback(Buffer.from(res));
				} catch (err) {
					console.error(err);
					callback(
						Buffer.from(
							new MpdResponse({
								command: {
									case: "error",
									value: { message: (err as Error).message },
								},
							}).toBinary(),
						),
					);
				}
			});

			// Execute the given commands in bulk.
			socket.on(SIO_MPD_COMMAND_BULK, async (msg: ArrayBuffer, callback) => {
				try {
					await mpdHandler.commandBulk(new Uint8Array(msg));
					callback();
				} catch (err) {
					console.error(err);
					callback(
						Buffer.from(
							new MpdResponse({
								command: {
									case: "error",
									value: { message: (err as Error).message },
								},
							}).toBinary(),
						),
					);
				}
			});

			// Register a plugin.
			socket.on(SIO_PLUGIN_REGISTER, async (msg: ArrayBuffer, callback) => {
				try {
					const resp = await pluginHandler.register(new Uint8Array(msg));
					callback(Buffer.from(resp));
				} catch (err) {
					console.error(err);
				}
			});

			// Execute a plugin command.
			socket.on(SIO_PLUGIN_EXECUTE, async (msg: ArrayBuffer) => {
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
