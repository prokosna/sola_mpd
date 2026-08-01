import { io, type Socket } from "socket.io-client";

import type { MessagingClient } from "./MessagingClient";

// Fail fast when the server never ACKs (e.g. disconnect mid-flight) instead of
// leaving the returned Promise pending forever.
const ACK_TIMEOUT_MS = 30_000;

export class MessagingClientSocketIo implements MessagingClient {
	private socket: Promise<Socket>;

	constructor() {
		this.socket = new Promise((resolve, reject) => {
			console.info("Connecting socket.io...");
			const socket = io(window.location.host, { path: "/io/" });

			socket.on("connect", () => {
				console.info("Socket.io is connected.");
				resolve(socket);
			});

			socket.on("exception", (err) => {
				console.error(err);
				reject(err);
			});

			socket.on("disconnect", () => {
				console.info("Socket.io is disconnected.");
			});
		});
	}

	isReady = async (): Promise<boolean> => {
		return (await this.socket).connected;
	};

	fetch = async <R>(
		event: string,
		payload: Uint8Array,
		fromBinary: (data: Uint8Array) => R,
	): Promise<R> => {
		const socket = await this.socket;
		const bytes = payload.buffer.slice(
			payload.byteOffset,
			payload.byteLength + payload.byteOffset,
		);
		return new Promise<R>((resolve, reject) => {
			socket
				.timeout(ACK_TIMEOUT_MS)
				.emit(event, bytes, (err: Error | null, resp: ArrayBuffer) => {
					if (err) {
						reject(err);
						return;
					}
					try {
						resolve(fromBinary(new Uint8Array(resp)));
					} catch (e) {
						reject(e);
					}
				});
		});
	};

	emit = async (event: string, payload: Uint8Array): Promise<Uint8Array> => {
		const socket = await this.socket;
		const bytes = payload.buffer.slice(
			payload.byteOffset,
			payload.byteLength + payload.byteOffset,
		);
		return new Promise<Uint8Array>((resolve, reject) => {
			socket
				.timeout(ACK_TIMEOUT_MS)
				.emit(event, bytes, (err: Error | null, data: ArrayBuffer) => {
					if (err) {
						reject(err);
						return;
					}
					resolve(new Uint8Array(data));
				});
		});
	};

	on = async (
		event: string,
		callback: (message: Uint8Array) => void,
	): Promise<void> => {
		const socket = await this.socket;
		socket.on(event, (data: ArrayBuffer) => {
			callback(new Uint8Array(data));
		});
	};

	off = async (event: string): Promise<void> => {
		const socket = await this.socket;
		socket.off(event);
	};
}
