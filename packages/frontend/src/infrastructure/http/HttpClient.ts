/**
 * HttpClient is an interface for an HTTP client.
 * It provides methods to fetch data from the server and to emit events.
 * It also provides methods to listen to events and to remove listeners.
 */
export interface HttpClient {
	get: <R>(
		endpoint: string,
		fromBinary: (bytes: Uint8Array) => R,
	) => Promise<R>;

	post: (endpoint: string, payload: Uint8Array) => Promise<void>;

	put: <R>(
		endpoint: string,
		payload: Uint8Array,
		fromBinary: (bytes: Uint8Array) => R,
	) => Promise<R>;
}
