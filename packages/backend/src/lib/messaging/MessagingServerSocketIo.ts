import type { Server as IOServer, Socket } from "socket.io";
import { toErrorMessage } from "../../utils/errorUtils.js";
import type {
	MessagingHandler,
	MessagingPeer,
	MessagingServer,
} from "./MessagingServer.js";

const toBinaryPayload = (msg: unknown): Uint8Array | undefined => {
	if (msg instanceof ArrayBuffer) {
		return new Uint8Array(msg);
	}
	if (ArrayBuffer.isView(msg)) {
		return new Uint8Array(msg.buffer, msg.byteOffset, msg.byteLength);
	}
	return undefined;
};

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
			socket.on(channel, async (msg: unknown, callback: unknown) => {
				const ack = typeof callback === "function" ? callback : undefined;
				try {
					const payload = toBinaryPayload(msg);
					if (payload === undefined) {
						ack?.(Buffer.alloc(0), { message: "Invalid payload" });
						return;
					}
					const result = await handler(payload, peer);
					ack?.(Buffer.from(result ?? new Uint8Array(0)));
				} catch (err) {
					console.error(err);
					try {
						ack?.(Buffer.alloc(0), { message: toErrorMessage(err) });
					} catch (ackErr) {
						console.error(ackErr);
					}
				}
			});
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
