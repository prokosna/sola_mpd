import type { Server as IOServer, Socket } from "socket.io";
import type {
	MessagingHandler,
	MessagingPeer,
	MessagingServer,
} from "./MessagingServer.js";

export class MessagingServerSocketIo implements MessagingServer {
	private readonly handlers = new Map<string, MessagingHandler>();
	private readonly disconnectListeners: Array<
		(peer: MessagingPeer) => Promise<void> | void
	> = [];

	constructor(private readonly io: IOServer) {
		io.on("connection", (socket) => this.bind(socket));
	}

	handle(channel: string, handler: MessagingHandler): void {
		this.handlers.set(channel, handler);
	}

	onDisconnect(listener: (peer: MessagingPeer) => Promise<void> | void): void {
		this.disconnectListeners.push(listener);
	}

	broadcast(
		channel: string,
		payload: Uint8Array,
		options?: { except?: string },
	): void {
		const target =
			options?.except === undefined ? this.io : this.io.except(options.except);
		target.emit(channel, Buffer.from(payload));
	}

	private bind(socket: Socket): void {
		console.info(`Socket.io is connected: ${socket.id}`);
		const peer: MessagingPeer = {
			id: socket.id,
			send: (channel, payload) => {
				if (socket.connected) {
					socket.emit(channel, Buffer.from(payload));
				}
			},
		};

		for (const [channel, handler] of this.handlers) {
			socket.on(
				channel,
				async (msg: ArrayBuffer, callback?: (res: Buffer) => void) => {
					let result: Uint8Array | undefined;
					try {
						result = await handler(new Uint8Array(msg), peer);
					} catch (err) {
						console.error(err);
					}
					callback?.(Buffer.from(result ?? new Uint8Array(0)));
				},
			);
		}

		socket.on("disconnect", async () => {
			for (const listener of this.disconnectListeners) {
				try {
					await listener(peer);
				} catch (err) {
					console.error(err);
				}
			}
		});
	}
}
