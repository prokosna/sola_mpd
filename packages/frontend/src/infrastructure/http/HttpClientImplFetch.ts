import type { HttpClient } from "./HttpClient";

/**
 * HttpClientImplFetch is an implementation of HttpClient that uses fetch api as the underlying transport.
 * It provides methods to fetch data from the server and to emit events.
 * It also provides methods to listen to events and to remove listeners.
 */
export class HttpClientImplFetch implements HttpClient {
	get = async <R>(
		endpoint: string,
		fromBinary: (bytes: Uint8Array) => R,
	): Promise<R> => {
		const ret = await fetch(endpoint);
		if (!ret.ok) {
			const body = await ret.text();
			throw new Error(`GET failed: ${body}`);
		}
		const body = await ret.arrayBuffer();
		return fromBinary(new Uint8Array(body));
	};

	post = async (endpoint: string, payload: Uint8Array): Promise<void> => {
		const ret = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/octet-stream",
			},
			body: payload.slice().buffer,
		});
		if (!ret.ok) {
			const body = await ret.text();
			throw new Error(`POST failed: ${body}`);
		}
		return;
	};

	put = async <R>(
		endpoint: string,
		payload: Uint8Array,
		fromBinary: (bytes: Uint8Array) => R,
	): Promise<R> => {
		const ret = await fetch(endpoint, {
			method: "PUT",
			headers: {
				"Content-Type": "application/octet-stream",
			},
			body: payload.slice().buffer,
		});
		if (!ret.ok) {
			const body = await ret.text();
			throw new Error(`PUT failed: ${body}`);
		}
		const body = await ret.arrayBuffer();
		return fromBinary(new Uint8Array(body));
	};
}
