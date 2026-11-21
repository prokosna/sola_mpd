import * as socketioConst from "@sola_mpd/shared/src/const/socketio.js";
import { describe, expect, it } from "vitest";
import {
	ALLOWED_INVOKE_CHANNELS,
	ALLOWED_RECEIVE_CHANNELS,
	CONFIG_KEYS,
	isAllowedInvokeChannel,
	isAllowedReceiveChannel,
	isPluginCallbackChannel,
} from "./channels.js";

describe("preload IPC channels parity with shared socketio constants", () => {
	it("includes every CONFIG_KEY_* constant from @sola_mpd/shared", () => {
		const sharedConfigKeys = Object.entries(socketioConst)
			.filter(([name]) => name.startsWith("CONFIG_KEY_"))
			.map(([, value]) => value)
			.sort();

		expect([...CONFIG_KEYS].sort()).toEqual(sharedConfigKeys);
	});

	it("accounts for every SOCKETIO_* constant defined in @sola_mpd/shared", () => {
		const knownSharedSocketEvents = new Set<string>([
			socketioConst.SOCKETIO_CONFIG_FETCH,
			socketioConst.SOCKETIO_CONFIG_SAVE,
			...ALLOWED_INVOKE_CHANNELS,
			...ALLOWED_RECEIVE_CHANNELS,
		]);

		const unknownSharedConstants = Object.entries(socketioConst)
			.filter(([name]) => name.startsWith("SOCKETIO_"))
			.map(([, value]) => value)
			.filter((eventName) => !knownSharedSocketEvents.has(eventName));

		expect(unknownSharedConstants).toEqual([]);
	});

	it("validates invoke and receive channels including plugin callback pattern", () => {
		expect(isAllowedInvokeChannel("socketio_mpd_command")).toBe(true);
		expect(isAllowedInvokeChannel("arbitrary_channel")).toBe(false);

		expect(isAllowedReceiveChannel("socketio_mpd_event")).toBe(true);
		expect(isAllowedReceiveChannel("1700000000000_0.12345")).toBe(true);
		expect(isAllowedReceiveChannel("arbitrary_channel")).toBe(false);

		expect(isPluginCallbackChannel("1700000000000_0.5")).toBe(true);
		expect(isPluginCallbackChannel("abc_123")).toBe(false);
		expect(isPluginCallbackChannel("123_")).toBe(false);
	});
});
