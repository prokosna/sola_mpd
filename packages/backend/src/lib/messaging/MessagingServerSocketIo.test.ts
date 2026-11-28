import type { Server as IOServer } from "socket.io";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MessagingPeer } from "./MessagingServer.js";
import { MessagingServerSocketIo } from "./MessagingServerSocketIo.js";

type Listener = (...args: unknown[]) => unknown;

const createFakeSocket = (id = "socket-1") => {
	const listeners = new Map<string, Listener>();
	return {
		id,
		connected: true,
		emit: vi.fn(),
		on: vi.fn((event: string, listener: Listener) => {
			listeners.set(event, listener);
		}),
		trigger: (event: string, ...args: unknown[]) => {
			const listener = listeners.get(event);
			if (listener === undefined) {
				throw new Error(`No listener for ${event}`);
			}
			return listener(...args);
		},
	};
};

const createFakeIo = () => {
	let onConnection: (socket: ReturnType<typeof createFakeSocket>) => void =
		() => {};
	const exceptEmit = vi.fn();
	const io = {
		on: vi.fn((event: string, handler: typeof onConnection) => {
			if (event === "connection") {
				onConnection = handler;
			}
		}),
		emit: vi.fn(),
		except: vi.fn(() => ({ emit: exceptEmit })),
	};
	return {
		io,
		exceptEmit,
		connect: (socket: ReturnType<typeof createFakeSocket>) =>
			onConnection(socket),
		server: () => new MessagingServerSocketIo(io as unknown as IOServer),
	};
};

describe("MessagingServerSocketIo", () => {
	beforeEach(() => {
		vi.spyOn(console, "info").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("binds registered channels on every connection and acks the result", async () => {
		const fake = createFakeIo();
		const server = fake.server();
		const handler = vi.fn(async (payload: Uint8Array) => payload.slice(1));
		server.handle("echo", handler);
		const a = createFakeSocket("a");
		const b = createFakeSocket("b");
		fake.connect(a);
		fake.connect(b);

		const ack = vi.fn();
		await a.trigger("echo", new Uint8Array([1, 2, 3]).buffer, ack);
		const ackB = vi.fn();
		await b.trigger("echo", new Uint8Array([9, 8]).buffer, ackB);

		expect(handler.mock.calls[0][0]).toEqual(new Uint8Array([1, 2, 3]));
		expect(ack.mock.calls).toEqual([[Buffer.from([2, 3])]]);
		expect(ackB.mock.calls).toEqual([[Buffer.from([8])]]);
	});

	it("acks an empty buffer when the handler returns nothing", async () => {
		const fake = createFakeIo();
		const server = fake.server();
		server.handle("noop", () => {});
		const socket = createFakeSocket();
		fake.connect(socket);

		const ack = vi.fn();
		await socket.trigger("noop", new ArrayBuffer(0), ack);

		expect(ack.mock.calls).toEqual([[Buffer.alloc(0)]]);
	});

	it("logs a failing handler and acks an empty buffer with the failure message", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const fake = createFakeIo();
		const server = fake.server();
		const failure = new Error("disk full");
		server.handle("fail", () => {
			throw failure;
		});
		server.handle("reject", async () => {
			throw failure;
		});
		const socket = createFakeSocket();
		fake.connect(socket);

		const ack = vi.fn();
		await socket.trigger("fail", new ArrayBuffer(0), ack);
		await socket.trigger("reject", new ArrayBuffer(0), ack);

		expect(ack.mock.calls).toEqual([
			[Buffer.alloc(0), { message: "disk full" }],
			[Buffer.alloc(0), { message: "disk full" }],
		]);
		expect(errorSpy).toHaveBeenCalledWith(failure);
	});

	it("tolerates a client that emits without an ack callback", async () => {
		const fake = createFakeIo();
		const server = fake.server();
		const handler = vi.fn(() => new Uint8Array([1]));
		server.handle("no_ack", handler);
		const socket = createFakeSocket();
		fake.connect(socket);

		await expect(
			socket.trigger("no_ack", new ArrayBuffer(0)),
		).resolves.toBeUndefined();
		expect(handler).toHaveBeenCalledTimes(1);
	});

	it("does not reject when the ack argument is not a function", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const fake = createFakeIo();
		const server = fake.server();
		server.handle("ok", () => new Uint8Array([1]));
		server.handle("fail", () => {
			throw new Error("boom");
		});
		const socket = createFakeSocket();
		fake.connect(socket);

		await expect(
			socket.trigger("ok", new ArrayBuffer(0), "not a function"),
		).resolves.toBeUndefined();
		await expect(
			socket.trigger("fail", new ArrayBuffer(0), { a: 1 }),
		).resolves.toBeUndefined();
		expect(errorSpy).toHaveBeenCalled();
	});

	it("does not reject when the ack itself throws", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const fake = createFakeIo();
		const server = fake.server();
		server.handle("ok", () => new Uint8Array([1]));
		const socket = createFakeSocket();
		fake.connect(socket);

		await expect(
			socket.trigger("ok", new ArrayBuffer(0), () => {
				throw new Error("ack failed");
			}),
		).resolves.toBeUndefined();
	});

	it.each([
		["a number", 1e9],
		["a string", "abc"],
		["undefined", undefined],
		["a plain object", { length: 3 }],
	])("rejects %s as a payload without calling the handler", async (_n, msg) => {
		const fake = createFakeIo();
		const server = fake.server();
		const handler = vi.fn();
		server.handle("echo", handler);
		const socket = createFakeSocket();
		fake.connect(socket);

		const ack = vi.fn();
		await socket.trigger("echo", msg, ack);

		expect(handler).not.toHaveBeenCalled();
		expect(ack.mock.calls).toEqual([
			[Buffer.alloc(0), { message: "Invalid payload" }],
		]);
	});

	it("passes a Buffer payload to the handler without copying", async () => {
		const fake = createFakeIo();
		const server = fake.server();
		const handler = vi.fn(async (payload: Uint8Array) => payload);
		server.handle("echo", handler);
		const socket = createFakeSocket();
		fake.connect(socket);
		const source = Buffer.from([1, 2, 3, 4]).subarray(1, 3);

		const ack = vi.fn();
		await socket.trigger("echo", source, ack);

		const received = handler.mock.calls[0][0];
		expect(Array.from(received)).toEqual([2, 3]);
		expect(received.buffer).toBe(source.buffer);
		expect(ack.mock.calls).toEqual([[Buffer.from([2, 3])]]);
	});

	it("gives handlers a peer that sends to its own socket and is a no-op after disconnect", async () => {
		const fake = createFakeIo();
		const server = fake.server();
		let peer: MessagingPeer | undefined;
		server.handle("who", (_payload, p) => {
			peer = p;
		});
		const socket = createFakeSocket("abc");
		fake.connect(socket);
		await socket.trigger("who", new ArrayBuffer(0), vi.fn());

		expect(peer?.id).toBe("abc");
		peer?.send("event", new Uint8Array([4, 5]));
		expect(socket.emit).toHaveBeenCalledWith("event", Buffer.from([4, 5]));

		socket.connected = false;
		peer?.send("event", new Uint8Array([6]));
		expect(socket.emit).toHaveBeenCalledTimes(1);
	});

	it("runs disconnect listeners with the peer and logs a failing listener", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const fake = createFakeIo();
		const server = fake.server();
		const failure = new Error("cleanup failed");
		const first = vi.fn(async () => {
			throw failure;
		});
		const second = vi.fn();
		server.onDisconnect(first);
		server.onDisconnect(second);
		const socket = createFakeSocket("gone");
		fake.connect(socket);

		await socket.trigger("disconnect");

		expect(first).toHaveBeenCalledWith(expect.objectContaining({ id: "gone" }));
		expect(second).toHaveBeenCalledWith(
			expect.objectContaining({ id: "gone" }),
		);
		expect(errorSpy).toHaveBeenCalledWith(failure);
	});

	it("broadcasts to everyone except the given socket id", () => {
		const fake = createFakeIo();
		const server = fake.server();

		server.broadcast("changed", new Uint8Array([1]), { except: "sender" });

		expect(fake.io.except).toHaveBeenCalledWith("sender");
		expect(fake.exceptEmit).toHaveBeenCalledWith("changed", Buffer.from([1]));
		expect(fake.io.emit).not.toHaveBeenCalled();
	});

	it("broadcasts to everyone when no socket is excluded", () => {
		const fake = createFakeIo();
		const server = fake.server();

		server.broadcast("changed", new Uint8Array([1]));

		expect(fake.io.emit).toHaveBeenCalledWith("changed", Buffer.from([1]));
		expect(fake.io.except).not.toHaveBeenCalled();
	});
});
