import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Ack = (err: Error | null, data?: ArrayBuffer, failure?: unknown) => void;

const fakeSocket = vi.hoisted(() => ({
	handlers: new Map<string, (...args: unknown[]) => void>(),
	timeoutMs: undefined as number | undefined,
	emitImpl: undefined as undefined | ((ack: Ack) => void),
}));

vi.mock("socket.io-client", () => ({
	io: () => ({
		on: (event: string, handler: (...args: unknown[]) => void) => {
			fakeSocket.handlers.set(event, handler);
		},
		timeout: (ms: number) => {
			fakeSocket.timeoutMs = ms;
			return {
				emit: (_event: string, _bytes: ArrayBuffer, ack: Ack) =>
					fakeSocket.emitImpl?.(ack),
			};
		},
	}),
}));

import { MessagingClientSocketIo } from "./MessagingClientSocketIo";

const connected = () => {
	vi.stubGlobal("window", { location: { host: "localhost" } });
	vi.spyOn(console, "info").mockImplementation(() => {});
	const client = new MessagingClientSocketIo();
	fakeSocket.handlers.get("connect")?.();
	return client;
};

const payload = new Uint8Array([1]);
const decode = (bytes: Uint8Array) => Array.from(bytes);

describe("MessagingClientSocketIo", () => {
	beforeEach(() => {
		fakeSocket.handlers.clear();
		fakeSocket.emitImpl = undefined;
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("resolves fetch and emit with the acknowledged payload", async () => {
		const client = connected();
		fakeSocket.emitImpl = (ack) => ack(null, new Uint8Array([7, 8]).buffer);

		await expect(client.fetch("e", payload, decode)).resolves.toEqual([7, 8]);
		await expect(client.emit("e", payload)).resolves.toEqual(
			new Uint8Array([7, 8]),
		);
	});

	it("rejects fetch and emit with the failure message", async () => {
		const client = connected();
		fakeSocket.emitImpl = (ack) =>
			ack(null, new ArrayBuffer(0), { message: "disk full" });

		await expect(client.fetch("e", payload, decode)).rejects.toThrow(
			"disk full",
		);
		await expect(client.emit("e", payload)).rejects.toThrow("disk full");
	});

	it("rejects on a malformed failure acknowledgement", async () => {
		const client = connected();
		fakeSocket.emitImpl = (ack) => ack(null, new ArrayBuffer(0), "oops");

		await expect(client.emit("e", payload)).rejects.toThrow();
	});

	it("rejects when the acknowledgement times out", async () => {
		const client = connected();
		fakeSocket.emitImpl = (ack) => ack(new Error("operation has timed out"));

		await expect(client.fetch("e", payload, decode)).rejects.toThrow(
			"timed out",
		);
		await expect(client.emit("e", payload)).rejects.toThrow("timed out");
		expect(fakeSocket.timeoutMs).toBeGreaterThan(0);
	});
});
