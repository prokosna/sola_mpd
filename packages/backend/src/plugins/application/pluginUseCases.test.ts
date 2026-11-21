import { create } from "@bufbuild/protobuf";
import {
	PluginExecuteResponse_Status,
	PluginExecuteResponseSchema,
	PluginRegisterRequestSchema,
	PluginRegisterResponseSchema,
} from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import {
	PluginExecuteRequestWrapperSchema,
	type PluginExecuteResponseWrapper,
	PluginRegisterRequestWrapperSchema,
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

const createRegisterRequest = (withRequest = true) => {
	return create(PluginRegisterRequestWrapperSchema, {
		request: withRequest
			? create(PluginRegisterRequestSchema, {
					host: "127.0.0.1",
					port: 3001,
				})
			: undefined,
	});
};

const createExecuteRequest = (withRequest = true) => {
	return create(PluginExecuteRequestWrapperSchema, {
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
	});
};

async function collect(
	generator: AsyncGenerator<[string, PluginExecuteResponseWrapper]>,
): Promise<Array<[string, PluginExecuteResponseWrapper]>> {
	const results: Array<[string, PluginExecuteResponseWrapper]> = [];
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
	it("registerPluginUseCase returns the response wrapper on success", async () => {
		const pluginClient = createPluginClient({
			register: vi
				.fn()
				.mockResolvedValue(create(PluginRegisterResponseSchema, {})),
		});

		const result = await registerPluginUseCase(
			createRegisterRequest(),
			pluginClient,
		);

		expect(pluginClient.register).toHaveBeenCalledTimes(1);
		expect(result.result.case).toBe("response");
	});

	it("registerPluginUseCase returns error wrapper when request is missing", async () => {
		const pluginClient = createPluginClient();

		const result = await registerPluginUseCase(
			createRegisterRequest(false),
			pluginClient,
		);

		expect(pluginClient.register).not.toHaveBeenCalled();
		expect(result.result.case).toBe("error");
	});

	it("executePluginUseCase yields response and completion", async () => {
		const pluginClient = createPluginClient({
			execute: vi.fn().mockReturnValue(streamResponses()),
		});

		const result = await collect(
			executePluginUseCase(createExecuteRequest(), pluginClient),
		);

		expect(pluginClient.execute).toHaveBeenCalledTimes(1);
		expect(result).toHaveLength(2);
		expect(result[0][0]).toBe("plugin:callback");
		expect(result[1][0]).toBe("plugin:callback");

		expect(result[0][1].result.case).toBe("response");
		expect(result[1][1].result.case).toBe("complete");
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
			executePluginUseCase(createExecuteRequest(), pluginClient),
		);

		expect(result).toHaveLength(1);
		const decoded = result[0][1];
		expect(decoded.result.case).toBe("error");
		if (decoded.result.case !== "error") {
			throw new Error("Unexpected result case");
		}
		expect(decoded.result.value).toContain("execute failed");
	});
});
