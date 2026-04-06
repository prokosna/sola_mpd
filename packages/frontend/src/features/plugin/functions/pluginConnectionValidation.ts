import { create } from "@bufbuild/protobuf";
import type { Plugin } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import {
	PluginRegisterRequestSchema,
	PluginSchema,
} from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";

import type { PluginService } from "../services/PluginService";

export function validateIpAndPort(input: string): boolean {
	const pattern = /^([^:]+):(\d+)$/;
	const match = input.match(pattern);
	if (match) {
		const port = Number.parseInt(match[2], 10);
		return port >= 0 && port <= 65535;
	}
	return false;
}

export type ConnectPluginResult =
	| { success: true; plugin: Plugin }
	| { success: false; errorMessage: string };

export async function connectPlugin(
	endpoint: string | undefined,
	pluginService: PluginService,
): Promise<ConnectPluginResult> {
	if (endpoint === undefined) {
		return { success: false, errorMessage: "Endpoint is required." };
	}
	if (!validateIpAndPort(endpoint)) {
		return {
			success: false,
			errorMessage: "Endpoint must be in the format: [IP]:[PORT]",
		};
	}

	const [host, port] = endpoint.split(":");
	const req = create(PluginRegisterRequestSchema, {
		host,
		port: Number(port),
	});

	try {
		const resp = await pluginService.register(req);
		if (resp.info === undefined) {
			return {
				success: false,
				errorMessage: "Plugin implementation is incorrect: info is undefined.",
			};
		}
		return {
			success: true,
			plugin: create(PluginSchema, {
				host,
				port: Number(port),
				info: resp.info,
				isAvailable: true,
			}),
		};
	} catch (e) {
		const errorMessage = e instanceof Error ? e.message : String(e);
		return { success: false, errorMessage };
	}
}
