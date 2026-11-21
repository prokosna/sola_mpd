export type MessagingPeer = {
	readonly id: string;
	// A no-op once the peer is gone.
	send: (channel: string, payload: Uint8Array) => void;
};

// An undefined result is acknowledged with an empty payload.
export type MessagingHandler = (
	payload: Uint8Array,
	peer: MessagingPeer,
) => Promise<Uint8Array | undefined> | Uint8Array | undefined;

export interface MessagingServer {
	handle: (channel: string, handler: MessagingHandler) => void;

	onDisconnect: (
		listener: (peer: MessagingPeer) => Promise<void> | void,
	) => void;

	broadcast: (
		channel: string,
		payload: Uint8Array,
		options?: { except?: string },
	) => void;
}
