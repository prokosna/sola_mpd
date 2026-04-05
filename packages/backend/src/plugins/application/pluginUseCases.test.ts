import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import {
	PluginExecuteResponse_Status,
	PluginExecuteResponseSchema,
	PluginRegisterRequestSchema,
	PluginRegisterResponseSchema,
} from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import {
	PluginExecuteRequestWrapperSchema,
	PluginExecuteResponseWrapperSchema,
	PluginRegisterRequestWrapperSchema,
	PluginRegisterResponseWrapperSchema,
} from "@sola_mpd/shared/src/models/plugin/plugin_wrapper_pb.js";
import { describe, expect, it, vi } from "vitest";
import type { PluginClient } from "../services/PluginClient.js";
import {
	executePluginUseCase,
	registerPluginUseCase,
} from "./pluginUseCases.js";

const createPluginClient = (
	overrides?: Partial<PluginClient>,
): PluginClient => {
	return {
		register: vi.fn(),
		execute: vi.fn(),
		...overrides,
	};
};

const createRegisterMessage = (withRequest = true): Uint8Array => {
	const request = withRequest
		? create(PluginRegisterRequestSchema, {
				host: "127.0.0.1",
				port: 3001,
			})
		: undefined;

	return new Uint8Array(
		toBinary(
			PluginRegisterRequestWrapperSchema,
			create(PluginRegisterRequestWrapperSchema, {
				request,
			}),
		),
	);
};

const createExecuteMessage = (withRequest = true): Uint8Array => {
	return new Uint8Array(
		toBinary(
			PluginExecuteRequestWrapperSchema,
			create(PluginExecuteRequestWrapperSchema, {
				request: withRequest
					? {
							host: "127.0.0.1",
							port: 3001,
							pluginParameters: {},
							requestParameters: {},
							songs: [],
						}
					: undefined,
				callbackEvent: "plugin:callback",
			}),
		),
	);
};

async function collect(
	generator: AsyncGenerator<[string, Uint8Array]>,
): Promise<Array<[string, Uint8Array]>> {
	const results: Array<[string, Uint8Array]> = [];
	for await (const item of generator) {
		results.push(item);
	}
	return results;
}

async function* streamResponses() {
	yield create(PluginExecuteResponseSchema, {
		message: "running",
		progressPercentage: 50,
		status: PluginExecuteResponse_Status.OK,
	});
}

describe("pluginUseCases", () => {
	it("registerPluginUseCase returns encoded response on success", async () => {
		const pluginClient = createPluginClient({
			register: vi
				.fn()
				.mockResolvedValue(create(PluginRegisterResponseSchema, {})),
		});

		const result = await registerPluginUseCase(
			createRegisterMessage(),
			pluginClient,
		);

		expect(pluginClient.register).toHaveBeenCalledTimes(1);
		const decoded = fromBinary(PluginRegisterResponseWrapperSchema, result);
		expect(decoded.result.case).toBe("response");
	});

	it("registerPluginUseCase returns error wrapper when request is missing", async () => {
		const pluginClient = createPluginClient();

		const result = await registerPluginUseCase(
			createRegisterMessage(false),
			pluginClient,
		);

		expect(pluginClient.register).not.toHaveBeenCalled();
		const decoded = fromBinary(PluginRegisterResponseWrapperSchema, result);
		expect(decoded.result.case).toBe("error");
	});

	it("executePluginUseCase yields response and completion", async () => {
		const pluginClient = createPluginClient({
			execute: vi.fn().mockReturnValue(streamResponses()),
		});

		const result = await collect(
			executePluginUseCase(createExecuteMessage(), pluginClient),
		);

		expect(pluginClient.execute).toHaveBeenCalledTimes(1);
		expect(result).toHaveLength(2);
		expect(result[0][0]).toBe("plugin:callback");
		expect(result[1][0]).toBe("plugin:callback");

		const first = fromBinary(PluginExecuteResponseWrapperSchema, result[0][1]);
		const second = fromBinary(PluginExecuteResponseWrapperSchema, result[1][1]);
		expect(first.result.case).toBe("response");
		expect(second.result.case).toBe("complete");
	});

	it("executePluginUseCase yields error when execution fails", async () => {
		const pluginClient = createPluginClient({
			execute: vi.fn().mockReturnValue({
				[Symbol.asyncIterator]: () => ({
					next: async () => {
						throw new Error("execute failed");
					},
				}),
			}),
		});

		const result = await collect(
			executePluginUseCase(createExecuteMessage(), pluginClient),
		);

		expect(result).toHaveLength(1);
		const decoded = fromBinary(
			PluginExecuteResponseWrapperSchema,
			result[0][1],
		);
		expect(decoded.result.case).toBe("error");
		if (decoded.result.case !== "error") {
			throw new Error("Unexpected result case");
		}
		expect(decoded.result.value).toContain("execute failed");
	});
});
