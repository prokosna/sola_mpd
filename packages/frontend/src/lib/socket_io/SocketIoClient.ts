export interface SocketIoClient {
	isReady: () => Promise<boolean>;

	fetch: <R>(
		event: string,
		payload: Uint8Array,
		fromBinary: (data: Uint8Array) => R,
	) => Promise<R>;

	emit: (event: string, payload: Uint8Array) => Promise<Uint8Array>;

	on: (event: string, callback: (message: Uint8Array) => void) => Promise<void>;

	off: (event: string) => Promise<void>;
}
