import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";
import { PluginService } from "@sola_mpd/domain/src/models/plugin/plugin_service_pb.js";

import {
	PluginExecuteRequestWrapperSchema,
	PluginExecuteResponseWrapperSchema,
	PluginRegisterRequestWrapperSchema,
	PluginRegisterResponseWrapperSchema,
} from "@sola_mpd/domain/src/models/plugin/plugin_wrapper_pb.js";

export class PluginMessageHandler {
	async register(msg: Uint8Array): Promise<Uint8Array> {
		const req = fromBinary(PluginRegisterRequestWrapperSchema, msg);

		try {
			const request = req.request;
			if (request === undefined) {
				throw new Error("Invalid PluginRegisterRequest: undefined");
			}

			const transport = createConnectTransport({
				baseUrl: `http://${request.host}:${request.port}`,
				httpVersion: "1.1",
			});

			const client = createClient(PluginService, transport);
			const resp = await client.register(request);
			const wrapper = create(PluginRegisterResponseWrapperSchema, {
				result: {
					case: "response",
					value: resp,
				},
			});
			return toBinary(PluginRegisterResponseWrapperSchema, wrapper);
		} catch (e) {
			console.error(e);
			const message = e instanceof Error ? e.message : String(e);
			const wrapper = create(PluginRegisterResponseWrapperSchema, {
				result: {
					case: "error",
					value: message,
				},
			});
			return toBinary(PluginRegisterResponseWrapperSchema, wrapper);
		}
	}

	async *execute(msg: Uint8Array): AsyncGenerator<[string, Uint8Array]> {
		const req = fromBinary(PluginExecuteRequestWrapperSchema, msg);

		try {
			const request = req.request;
			if (request === undefined) {
				throw new Error("Invalid PluginExecutionRequest: undefined");
			}

			const transport = createConnectTransport({
				baseUrl: `http://${request.host}:${request.port}`,
				httpVersion: "1.1",
			});

			const client = createClient(PluginService, transport);

			for await (const resp of client.execute(request)) {
				yield [
					req.callbackEvent,
					toBinary(
						PluginExecuteResponseWrapperSchema,
						create(PluginExecuteResponseWrapperSchema, {
							result: {
								case: "response",
								value: resp,
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
			console.error(err);
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
	}
}
