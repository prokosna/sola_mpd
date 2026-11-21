import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import {
	SOCKETIO_PLUGIN_EXECUTE,
	SOCKETIO_PLUGIN_REGISTER,
} from "@sola_mpd/shared/src/const/socketio.js";
import {
	PluginExecuteRequestWrapperSchema,
	PluginExecuteResponseWrapperSchema,
	PluginRegisterRequestWrapperSchema,
	PluginRegisterResponseWrapperSchema,
} from "@sola_mpd/shared/src/models/plugin/plugin_wrapper_pb.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeMessagingServer } from "../../lib/messaging/fakeMessagingServer.js";
import type { PluginClient } from "../services/PluginClient.js";
import { registerPluginHandlers } from "./registerPluginHandlers.js";

describe("registerPluginHandlers", () => {
	const pluginClient = { register: vi.fn(), execute: vi.fn() };
	let fake: ReturnType<typeof createFakeMessagingServer>;

	beforeEach(() => {
		vi.resetAllMocks();
		vi.spyOn(console, "error").mockImplementation(() => {});
		fake = createFakeMessagingServer();
		registerPluginHandlers(fake.server, {
			pluginClient: pluginClient as unknown as PluginClient,
		});
	});

	it("returns the registration response", async () => {
		const response = { name: "plugin" };
		pluginClient.register.mockResolvedValue(response);
		const msg = toBinary(
			PluginRegisterRequestWrapperSchema,
			create(PluginRegisterRequestWrapperSchema, { request: {} }),
		);

		const result = await fake.call(SOCKETIO_PLUGIN_REGISTER, msg);

		expect(
			fromBinary(PluginRegisterResponseWrapperSchema, result as Uint8Array)
				.result.case,
		).toBe("response");
	});

	it("encodes a missing registration request as an error wrapper", async () => {
		const msg = toBinary(
			PluginRegisterRequestWrapperSchema,
			create(PluginRegisterRequestWrapperSchema, {}),
		);

		const result = await fake.call(SOCKETIO_PLUGIN_REGISTER, msg);

		expect(
			fromBinary(PluginRegisterResponseWrapperSchema, result as Uint8Array)
				.result.case,
		).toBe("error");
		expect(pluginClient.register).not.toHaveBeenCalled();
	});

	it("maps an undecodable registration request to a register error response", async () => {
		const result = await fake.call(
			SOCKETIO_PLUGIN_REGISTER,
			new Uint8Array([0xff, 0xff, 0xff]),
		);

		expect(
			fromBinary(PluginRegisterResponseWrapperSchema, result as Uint8Array)
				.result.case,
		).toBe("error");
	});

	it("acknowledges execution on receipt and streams results to the peer", async () => {
		let release: () => void = () => {};
		const gate = new Promise<void>((resolve) => {
			release = resolve;
		});
		pluginClient.execute.mockImplementation(async function* () {
			await gate;
			yield { result: "one" };
		});
		const { peer, send } = fake.createPeer();
		const msg = toBinary(
			PluginExecuteRequestWrapperSchema,
			create(PluginExecuteRequestWrapperSchema, {
				callbackEvent: "cb_1",
				request: {},
			}),
		);

		const ack = await fake.call(SOCKETIO_PLUGIN_EXECUTE, msg, peer);

		expect(ack).toBeUndefined();
		expect(send).not.toHaveBeenCalled();

		release();
		await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(2));
		expect(send.mock.calls[0][0]).toBe("cb_1");
		expect(
			fromBinary(PluginExecuteResponseWrapperSchema, send.mock.calls[0][1])
				.result.case,
		).toBe("response");
		expect(
			fromBinary(PluginExecuteResponseWrapperSchema, send.mock.calls[1][1])
				.result.case,
		).toBe("complete");
	});

	it("rejects an undecodable execute request before acknowledging", async () => {
		const { peer } = fake.createPeer();

		await expect(
			fake.call(
				SOCKETIO_PLUGIN_EXECUTE,
				new Uint8Array([0xff, 0xff, 0xff]),
				peer,
			),
		).rejects.toThrow();
		expect(pluginClient.execute).not.toHaveBeenCalled();
	});

	it("logs a failing stream and sends the error to the callback event", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const { peer, send } = fake.createPeer();
		const failure = new Error("send failed");
		send.mockImplementationOnce(() => {
			throw failure;
		});
		pluginClient.execute.mockImplementation(async function* () {
			yield { result: "one" };
		});
		const msg = toBinary(
			PluginExecuteRequestWrapperSchema,
			create(PluginExecuteRequestWrapperSchema, {
				callbackEvent: "cb_1",
				request: {},
			}),
		);

		await expect(
			fake.call(SOCKETIO_PLUGIN_EXECUTE, msg, peer),
		).resolves.toBeUndefined();

		await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(2));
		expect(errorSpy).toHaveBeenCalledWith(failure);
		expect(send.mock.calls[1][0]).toBe("cb_1");
		const wrapper = fromBinary(
			PluginExecuteResponseWrapperSchema,
			send.mock.calls[1][1],
		);
		expect(wrapper.result).toEqual({ case: "error", value: "send failed" });
	});

	it("logs instead of rejecting when reporting the failure also fails", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const unhandled = vi.fn();
		process.on("unhandledRejection", unhandled);
		const { peer, send } = fake.createPeer();
		send.mockImplementation(() => {
			throw new Error("peer gone");
		});
		pluginClient.execute.mockImplementation(async function* () {
			yield { result: "one" };
		});
		const msg = toBinary(
			PluginExecuteRequestWrapperSchema,
			create(PluginExecuteRequestWrapperSchema, {
				callbackEvent: "cb_1",
				request: {},
			}),
		);

		await fake.call(SOCKETIO_PLUGIN_EXECUTE, msg, peer);

		await vi.waitFor(() => expect(errorSpy).toHaveBeenCalledTimes(2));
		await new Promise((resolve) => setTimeout(resolve, 0));
		process.off("unhandledRejection", unhandled);
		expect(unhandled).not.toHaveBeenCalled();
	});
});
