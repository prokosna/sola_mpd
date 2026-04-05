import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import {
	PluginExecuteRequestWrapperSchema,
	PluginExecuteResponseWrapperSchema,
	PluginRegisterRequestWrapperSchema,
	PluginRegisterResponseWrapperSchema,
} from "@sola_mpd/shared/src/models/plugin/plugin_wrapper_pb.js";
import type { PluginClient } from "../services/PluginClient.js";

export const registerPluginUseCase = async (
	msg: Uint8Array,
	pluginClient: PluginClient,
): Promise<Uint8Array> => {
	const req = fromBinary(PluginRegisterRequestWrapperSchema, msg);

	try {
		const request = req.request;
		if (request === undefined) {
			throw new Error("Invalid PluginRegisterRequest: undefined");
		}

		const response = await pluginClient.register(request);
		const wrapper = create(PluginRegisterResponseWrapperSchema, {
			result: {
				case: "response",
				value: response,
			},
		});
		return toBinary(PluginRegisterResponseWrapperSchema, wrapper);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		const wrapper = create(PluginRegisterResponseWrapperSchema, {
			result: {
				case: "error",
				value: message,
			},
		});
		return toBinary(PluginRegisterResponseWrapperSchema, wrapper);
	}
};

export const executePluginUseCase = async function* (
	msg: Uint8Array,
	pluginClient: PluginClient,
): AsyncGenerator<[string, Uint8Array]> {
	const req = fromBinary(PluginExecuteRequestWrapperSchema, msg);

	try {
		const request = req.request;
		if (request === undefined) {
			throw new Error("Invalid PluginExecutionRequest: undefined");
		}

		for await (const response of pluginClient.execute(request)) {
			yield [
				req.callbackEvent,
				toBinary(
					PluginExecuteResponseWrapperSchema,
					create(PluginExecuteResponseWrapperSchema, {
						result: {
							case: "response",
							value: response,
						},
					}),
				),
			];
		}

		yield [
			req.callbackEvent,
			toBinary(
				PluginExecuteResponseWrapperSchema,
				create(PluginExecuteResponseWrapperSchema, {
					result: {
						case: "complete",
						value: true,
					},
				}),
			),
		];
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		const wrapper = create(PluginExecuteResponseWrapperSchema, {
			result: {
				case: "error",
				value: message,
			},
		});
		yield [
			req.callbackEvent,
			toBinary(PluginExecuteResponseWrapperSchema, wrapper),
		];
	}
};
