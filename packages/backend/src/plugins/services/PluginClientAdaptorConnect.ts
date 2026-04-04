import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";
import { PluginService } from "@sola_mpd/shared/src/models/plugin/plugin_service_pb.js";
import type { PluginClientPort } from "./PluginClientPort.js";

export const pluginClientAdaptorConnect: PluginClientPort = {
	register: async (request) => {
		const transport = createConnectTransport({
			baseUrl: `http://${request.host}:${request.port}`,
			httpVersion: "1.1",
		});
		const client = createClient(PluginService, transport);
		return client.register(request);
	},
	execute: (request) => {
		const transport = createConnectTransport({
			baseUrl: `http://${request.host}:${request.port}`,
			httpVersion: "1.1",
		});
		const client = createClient(PluginService, transport);
		return client.execute(request);
	},
};
