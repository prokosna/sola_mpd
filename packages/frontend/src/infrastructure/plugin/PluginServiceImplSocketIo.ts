import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import {
	SIO_PLUGIN_EXECUTE,
	SIO_PLUGIN_REGISTER,
} from "@sola_mpd/domain/src/const/socketio.js";
import type {
	PluginExecuteRequest,
	PluginExecuteResponse,
	PluginRegisterRequest,
	PluginRegisterResponse,
} from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";

import {
	PluginExecuteRequestWrapperSchema,
	PluginExecuteResponseWrapperSchema,
	PluginRegisterRequestWrapperSchema,
	PluginRegisterResponseWrapperSchema,
} from "@sola_mpd/domain/src/models/plugin/plugin_wrapper_pb.js";

import { type Observable, Subject } from "rxjs";

import type { PluginService } from "../../features/plugin";
import type { SocketIoClient } from "../socket_io/SocketIoClient";

/**
 * Implementation of PluginService using SocketIoClient.
 */
export class PluginServiceImplSocketIo implements PluginService {
	constructor(private readonly client: SocketIoClient) {}

	register = async (
		req: PluginRegisterRequest,
	): Promise<PluginRegisterResponse> => {
		const reqWrapper = create(PluginRegisterRequestWrapperSchema, {
			request: req,
		});
		const bytes = toBinary(PluginRegisterRequestWrapperSchema, reqWrapper);
		const data = await this.client.emit(SIO_PLUGIN_REGISTER, bytes);
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
		const reqWrapper = create(PluginExecuteRequestWrapperSchema, {
			request: req,
			callbackEvent: `${Date.now()}_${Math.random()}`,
		});
		const bytes = toBinary(PluginExecuteRequestWrapperSchema, reqWrapper);

		const subject = new Subject<PluginExecuteResponse>();

		this.client.on(reqWrapper.callbackEvent, (data: Uint8Array) => {
			try {
				const resp = fromBinary(PluginExecuteResponseWrapperSchema, data);
				switch (resp.result.case) {
					case "response":
						subject.next(resp.result.value);
						break;
					case "complete":
						subject.complete();
						this.client.off(reqWrapper.callbackEvent);
						break;
					case "error":
						subject.error(new Error(resp.result.value));
						this.client.off(reqWrapper.callbackEvent);
						break;
					default:
						subject.error(new Error("No plugin execution result"));
						break;
				}
			} catch (e) {
				subject.error(e);
				this.client.off(reqWrapper.callbackEvent);
			}
		});

		this.client.emit(SIO_PLUGIN_EXECUTE, bytes);

		return subject;
	};
}
