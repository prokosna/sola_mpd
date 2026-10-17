import { EventEmitter } from "node:events";
import { create } from "@bufbuild/protobuf";
import { MpdRequestSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import {
	type MpdEvent,
	MpdEvent_EventType,
} from "@sola_mpd/shared/src/models/mpd/mpd_event_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

class FakeClient extends EventEmitter {
	PROTOCOL_VERSION = "0.24.0";
	sendCommand = vi.fn(async () => "OK");
	disconnect = vi.fn(async () => {
		this.emit("close");
	});
}

const connect = vi.fn(async () => new FakeClient());

vi.mock("@prokosna/mpd3", () => ({
	Client: { connect: (...args: unknown[]) => connect(...(args as [])) },
	Command: { cmd: (name: string) => ({ name }) },
	Parsers: {},
}));

const { mpdClientMpd3 } = await import("./MpdClientMpd3.js");

let profileSeq = 0;
const createProfile = () =>
	create(MpdProfileSchema, {
		name: "default",
		host: "localhost",
		port: 6600 + ++profileSeq,
		password: "",
	});

const connectedClient = async (index: number): Promise<FakeClient> =>
	(await connect.mock.results[index].value) as FakeClient;

describe("MpdClientMpd3 subscriptions", () => {
	beforeEach(() => {
		connect.mockClear();
		vi.spyOn(console, "info").mockImplementation(() => {});
	});

	it("maps idle subsystems to event types", async () => {
		const events: MpdEvent[] = [];
		await mpdClientMpd3.subscribe(createProfile(), (e) => events.push(e));
		const client = await connectedClient(0);

		client.emit("system", "player");
		client.emit("system", "playlist");

		expect(events.map((e) => e.eventType)).toEqual([
			MpdEvent_EventType.PLAYER,
			MpdEvent_EventType.PLAY_QUEUE,
		]);
	});

	it.each([
		[
			"after mpd3 gives up reconnecting",
			new Error("max reconnection attempts"),
		],
		["on a clean disconnect", undefined],
	])("reports DISCONNECTED once %s", async (_, error) => {
		const events: MpdEvent[] = [];
		await mpdClientMpd3.subscribe(createProfile(), (e) => events.push(e));
		const client = await connectedClient(0);

		client.emit("close", error);
		client.emit("close");
		client.emit("system", "player");

		expect(events.map((e) => e.eventType)).toEqual([
			MpdEvent_EventType.DISCONNECTED,
		]);
	});

	it("opens a new connection when subscribing after a close", async () => {
		const profile = createProfile();
		await mpdClientMpd3.subscribe(profile, () => {});
		(await connectedClient(0)).emit("close", new Error("gone"));

		const events: MpdEvent[] = [];
		await mpdClientMpd3.subscribe(profile, (e) => events.push(e));

		expect(connect).toHaveBeenCalledTimes(2);
		(await connectedClient(1)).emit("system", "mixer");
		expect(events).toHaveLength(1);
	});

	it("unsubscribes a closed subscription without reconnecting", async () => {
		const profile = createProfile();
		const handle = await mpdClientMpd3.subscribe(profile, () => {});
		(await connectedClient(0)).emit("close", new Error("gone"));

		await expect(mpdClientMpd3.unsubscribe(profile, handle)).resolves.toBe(
			true,
		);
		expect(connect).toHaveBeenCalledTimes(1);
	});

	it("stops forwarding events after unsubscribing", async () => {
		const profile = createProfile();
		const callback = vi.fn();
		const handle = await mpdClientMpd3.subscribe(profile, callback);
		const client = await connectedClient(0);

		await mpdClientMpd3.unsubscribe(profile, handle);
		client.emit("system", "player");
		client.emit("close");

		expect(callback).not.toHaveBeenCalled();
		expect(client.listenerCount("system")).toBe(0);
	});

	it("keeps the cached connection when an uncached ping client closes", async () => {
		const profile = createProfile();
		const callback = vi.fn();
		await mpdClientMpd3.subscribe(profile, callback);

		await mpdClientMpd3.execute(
			create(MpdRequestSchema, {
				profile,
				command: { case: "ping", value: {} },
			}),
		);
		await mpdClientMpd3.subscribe(profile, () => {});

		expect(connect).toHaveBeenCalledTimes(2);
		expect(callback).not.toHaveBeenCalled();
	});
});
