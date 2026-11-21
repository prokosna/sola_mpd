import { vi } from "vitest";
import type {
	MessagingHandler,
	MessagingPeer,
	MessagingServer,
} from "./MessagingServer.js";

// Test double: invokes registered handlers directly, as the adapter would after decoding a message.
export const createFakeMessagingServer = () => {
	const handlers = new Map<string, MessagingHandler>();
	const disconnectListeners: Array<
		(peer: MessagingPeer) => Promise<void> | void
	> = [];
	const broadcast =
		vi.fn<
			(
				channel: string,
				payload: Uint8Array,
				options?: { except?: string },
			) => void
		>();

	const server: MessagingServer = {
		handle: (channel, handler) => {
			handlers.set(channel, handler);
		},
		onDisconnect: (listener) => {
			disconnectListeners.push(listener);
		},
		broadcast,
	};

	const createPeer = (id = "peer-1") => {
		const send = vi.fn<(channel: string, payload: Uint8Array) => void>();
		const peer: MessagingPeer = { id, send };
		return { peer, send };
	};

	return {
		server,
		broadcast,
		createPeer,
		channels: () => [...handlers.keys()],
		call: async (
			channel: string,
			payload: Uint8Array = new Uint8Array(0),
			peer: MessagingPeer = createPeer().peer,
		) => {
			const handler = handlers.get(channel);
			if (handler === undefined) {
				throw new Error(`No handler registered for ${channel}`);
			}
			return handler(payload, peer);
		},
		disconnect: async (peer: MessagingPeer) => {
			for (const listener of disconnectListeners) {
				await listener(peer);
			}
		},
	};
};
