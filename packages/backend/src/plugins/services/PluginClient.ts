import type {
	PluginExecuteRequest,
	PluginExecuteResponse,
	PluginRegisterRequest,
	PluginRegisterResponse,
} from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";

export interface PluginClient {
	register: (request: PluginRegisterRequest) => Promise<PluginRegisterResponse>;
	execute: (
		request: PluginExecuteRequest,
	) => AsyncIterable<PluginExecuteResponse>;
}
