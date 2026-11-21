import { EventEmitter } from "node:events";
import type { IpcMain } from "electron";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MessagingPeer } from "#backend/lib/messaging/MessagingServer.js";
import { MessagingServerElectronIpc } from "./MessagingServerElectronIpc.js";

class FakeWebContents extends EventEmitter {
	destroyed = false;
	readonly send = vi.fn<(channel: string, payload: Uint8Array) => void>();

	constructor(readonly id: number) {
		super();
	}

	isDestroyed(): boolean {
		return this.destroyed;
	}

	reload(): void {
		this.emit("did-start-navigation", {
			isMainFrame: true,
			isSameDocument: false,
		});
	}

	destroy(): void {
		this.destroyed = true;
		this.emit("destroyed");
	}
}

type InvokeHandler = (
	event: { sender: FakeWebContents },
	payload: Uint8Array,
) => Promise<Uint8Array>;

const createIpcMain = () => {
	const handlers = new Map<string, InvokeHandler>();
	const ipcMain = {
		handle: vi.fn((channel: string, handler: InvokeHandler) => {
			if (handlers.has(channel)) {
				throw new Error(`second handler for ${channel}`);
			}
			handlers.set(channel, handler);
		}),
	};
	const invoke = (
		channel: string,
		sender: FakeWebContents,
		payload = new Uint8Array([1]),
	) => {
		const handler = handlers.get(channel);
		if (handler === undefined) {
			throw new Error(`no handler for ${channel}`);
		}
		return handler({ sender }, payload);
	};
	return {
		ipcMain: ipcMain as unknown as IpcMain,
		invoke,
		handle: ipcMain.handle,
	};
};

describe("MessagingServerElectronIpc", () => {
	let ipc: ReturnType<typeof createIpcMain>;
	let server: MessagingServerElectronIpc;
	let seen: MessagingPeer[];

	beforeEach(() => {
		ipc = createIpcMain();
		server = new MessagingServerElectronIpc(ipc.ipcMain);
		seen = [];
		server.handle("ch", (_payload, peer) => {
			seen.push(peer);
		});
	});

	it("registers each channel once with ipcMain", () => {
		expect(ipc.handle).toHaveBeenCalledTimes(1);
		expect(ipc.handle).toHaveBeenCalledWith("ch", expect.any(Function));
	});

	it("returns the handler result, and an empty payload for undefined", async () => {
		server.handle("echo", (payload) => payload);
		const wc = new FakeWebContents(1);

		await expect(ipc.invoke("echo", wc, new Uint8Array([7]))).resolves.toEqual(
			new Uint8Array([7]),
		);
		await expect(ipc.invoke("ch", wc)).resolves.toEqual(new Uint8Array(0));
	});

	it("rejects the invoke when the handler throws", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		server.handle("boom", () => {
			throw new Error("disk full");
		});

		await expect(ipc.invoke("boom", new FakeWebContents(1))).rejects.toThrow(
			"disk full",
		);
	});

	it("keeps one peer per document across invokes", async () => {
		const wc = new FakeWebContents(1);

		await ipc.invoke("ch", wc);
		await ipc.invoke("ch", wc);

		expect(seen[0].id).toBe(seen[1].id);
	});

	it("gives separate windows separate peers", async () => {
		await ipc.invoke("ch", new FakeWebContents(1));
		await ipc.invoke("ch", new FakeWebContents(2));

		expect(seen[0].id).not.toBe(seen[1].id);
	});

	it("ends the peer on reload and starts a new one", async () => {
		const disconnected = vi.fn();
		server.onDisconnect(disconnected);
		const wc = new FakeWebContents(1);
		await ipc.invoke("ch", wc);

		wc.reload();
		await ipc.invoke("ch", wc);

		expect(disconnected).toHaveBeenCalledTimes(1);
		expect(disconnected.mock.calls[0][0].id).toBe(seen[0].id);
		expect(seen[1].id).not.toBe(seen[0].id);
	});

	it("ignores same-document and subframe navigations", async () => {
		const disconnected = vi.fn();
		server.onDisconnect(disconnected);
		const wc = new FakeWebContents(1);
		await ipc.invoke("ch", wc);

		wc.emit("did-start-navigation", {
			isMainFrame: true,
			isSameDocument: true,
		});
		wc.emit("did-start-navigation", {
			isMainFrame: false,
			isSameDocument: false,
		});
		await ipc.invoke("ch", wc);

		expect(disconnected).not.toHaveBeenCalled();
		expect(seen[1].id).toBe(seen[0].id);
	});

	it("ends the peer when the renderer process is gone", async () => {
		const disconnected = vi.fn();
		server.onDisconnect(disconnected);
		const wc = new FakeWebContents(1);
		await ipc.invoke("ch", wc);

		wc.emit("render-process-gone", {}, { reason: "crashed" });

		expect(disconnected).toHaveBeenCalledTimes(1);
	});

	it("ends the peer when the webContents is destroyed", async () => {
		const disconnected = vi.fn();
		server.onDisconnect(disconnected);
		const wc = new FakeWebContents(1);
		await ipc.invoke("ch", wc);

		wc.destroy();

		expect(disconnected).toHaveBeenCalledTimes(1);
	});

	it("does not end a peer twice or attach listeners per invoke", async () => {
		const disconnected = vi.fn();
		server.onDisconnect(disconnected);
		const wc = new FakeWebContents(1);
		await ipc.invoke("ch", wc);
		await ipc.invoke("ch", wc);
		await ipc.invoke("ch", wc);

		wc.reload();
		wc.reload();

		expect(disconnected).toHaveBeenCalledTimes(1);
	});

	it("logs a failing disconnect listener without throwing", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		server.onDisconnect(() => {
			throw new Error("cleanup failed");
		});
		const wc = new FakeWebContents(1);
		await ipc.invoke("ch", wc);

		expect(() => wc.reload()).not.toThrow();
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(errorSpy).toHaveBeenCalled();
	});

	it("sends to the live document only", async () => {
		const wc = new FakeWebContents(1);
		await ipc.invoke("ch", wc);
		const oldPeer = seen[0];

		oldPeer.send("event", new Uint8Array([1]));
		wc.reload();
		oldPeer.send("event", new Uint8Array([2]));
		await ipc.invoke("ch", wc);
		seen[1].send("event", new Uint8Array([3]));

		expect(wc.send.mock.calls).toEqual([
			["event", new Uint8Array([1])],
			["event", new Uint8Array([3])],
		]);
	});

	it("does not send to a destroyed webContents", async () => {
		const wc = new FakeWebContents(1);
		await ipc.invoke("ch", wc);

		wc.destroyed = true;
		seen[0].send("event", new Uint8Array([1]));

		expect(wc.send).not.toHaveBeenCalled();
	});

	it("broadcasts to every live peer except the given one", async () => {
		const a = new FakeWebContents(1);
		const b = new FakeWebContents(2);
		await ipc.invoke("ch", a);
		await ipc.invoke("ch", b);

		server.broadcast("changed", new Uint8Array([9]), { except: seen[0].id });
		server.broadcast("all", new Uint8Array([8]));

		expect(a.send.mock.calls).toEqual([["all", new Uint8Array([8])]]);
		expect(b.send.mock.calls).toEqual([
			["changed", new Uint8Array([9])],
			["all", new Uint8Array([8])],
		]);
	});
});
