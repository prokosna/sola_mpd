import { create } from "@bufbuild/protobuf";
import {
	type PluginExecuteRequestWrapper,
	type PluginExecuteResponseWrapper,
	PluginExecuteResponseWrapperSchema,
	type PluginRegisterRequestWrapper,
	type PluginRegisterResponseWrapper,
	PluginRegisterResponseWrapperSchema,
} from "@sola_mpd/shared/src/models/plugin/plugin_wrapper_pb.js";
import { toErrorMessage } from "../../utils/errorUtils.js";
import type { PluginClient } from "../services/PluginClient.js";

export const registerPluginUseCase = async (
	req: PluginRegisterRequestWrapper,
	pluginClient: PluginClient,
): Promise<PluginRegisterResponseWrapper> => {
	try {
		const request = req.request;
		if (request === undefined) {
			throw new Error("Invalid PluginRegisterRequest: undefined");
		}

		const response = await pluginClient.register(request);
		return create(PluginRegisterResponseWrapperSchema, {
			result: {
				case: "response",
				value: response,
			},
		});
	} catch (err) {
		return create(PluginRegisterResponseWrapperSchema, {
			result: {
				case: "error",
				value: toErrorMessage(err),
			},
		});
	}
};

export const executePluginUseCase = async function* (
	req: PluginExecuteRequestWrapper,
	pluginClient: PluginClient,
): AsyncGenerator<[string, PluginExecuteResponseWrapper]> {
	const callbackEvent = req.callbackEvent;

	try {
		const request = req.request;
		if (request === undefined) {
			throw new Error("Invalid PluginExecutionRequest: undefined");
		}

		for await (const response of pluginClient.execute(request)) {
			yield [
				callbackEvent,
				create(PluginExecuteResponseWrapperSchema, {
					result: {
						case: "response",
						value: response,
					},
				}),
			];
		}

		yield [
			callbackEvent,
			create(PluginExecuteResponseWrapperSchema, {
				result: {
					case: "complete",
					value: true,
				},
			}),
		];
	} catch (err) {
		yield [
			callbackEvent,
			create(PluginExecuteResponseWrapperSchema, {
				result: {
					case: "error",
					value: toErrorMessage(err),
				},
			}),
		];
	}
};
