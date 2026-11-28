import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import {
	SOCKETIO_PLUGIN_EXECUTE,
	SOCKETIO_PLUGIN_REGISTER,
} from "@sola_mpd/shared/src/const/socketio.js";
import type {
	PluginExecuteRequest,
	PluginExecuteResponse,
	PluginRegisterRequest,
	PluginRegisterResponse,
} from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";

import {
	PluginExecuteRequestWrapperSchema,
	PluginExecuteResponseWrapperSchema,
	PluginRegisterRequestWrapperSchema,
	PluginRegisterResponseWrapperSchema,
} from "@sola_mpd/shared/src/models/plugin/plugin_wrapper_pb.js";

import { Observable } from "rxjs";

import type { MessagingClient } from "../../../lib/messaging/MessagingClient";
import type { PluginService } from "./PluginService";

export class PluginServiceMessaging implements PluginService {
	constructor(private readonly client: MessagingClient) {}

	register = async (
		req: PluginRegisterRequest,
	): Promise<PluginRegisterResponse> => {
		const reqWrapper = create(PluginRegisterRequestWrapperSchema, {
			request: req,
		});
		const bytes = toBinary(PluginRegisterRequestWrapperSchema, reqWrapper);
		const data = await this.client.emit(SOCKETIO_PLUGIN_REGISTER, bytes);
		const resp = fromBinary(PluginRegisterResponseWrapperSchema, data);
		switch (resp.result.case) {
			case "response":
				return resp.result.value;
			case "error":
				throw new Error(resp.result.value);
			default:
				throw new Error("No plugin registration result");
		}
	};

	execute = (req: PluginExecuteRequest): Observable<PluginExecuteResponse> => {
		return new Observable<PluginExecuteResponse>((subscriber) => {
			const reqWrapper = create(PluginExecuteRequestWrapperSchema, {
				request: req,
				callbackEvent: `${Date.now()}_${Math.random()}`,
			});
			const bytes = toBinary(PluginExecuteRequestWrapperSchema, reqWrapper);
			const callbackEvent = reqWrapper.callbackEvent;

			const removeDisconnectListener = this.client.onDisconnect(() => {
				subscriber.error(new Error("Connection lost during plugin execution"));
			});

			void (async () => {
				try {
					await this.client.on(callbackEvent, (data: Uint8Array) => {
						try {
							const resp = fromBinary(PluginExecuteResponseWrapperSchema, data);
							switch (resp.result.case) {
								case "response":
									subscriber.next(resp.result.value);
									break;
								case "complete":
									subscriber.complete();
									break;
								case "error":
									subscriber.error(new Error(resp.result.value));
									break;
								default:
									subscriber.error(new Error("No plugin execution result"));
									break;
							}
						} catch (e) {
							subscriber.error(e);
						}
					});
					if (subscriber.closed) {
						// Teardown ran before the listener was registered.
						await this.client.off(callbackEvent);
						return;
					}
					await this.client.emit(SOCKETIO_PLUGIN_EXECUTE, bytes);
				} catch (e) {
					subscriber.error(e);
				}
			})();

			return () => {
				removeDisconnectListener();
				void this.client.off(callbackEvent);
			};
		});
	};
}
