import { clone, create } from "@bufbuild/protobuf";
import type {
	Plugin,
	PluginState,
} from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import {
	PluginRegisterRequestSchema,
	PluginSchema,
	PluginStateSchema,
} from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";

import type { PluginService } from "../services/PluginService";

export async function registerPluginAndCheckAvailability(
	plugin: Plugin,
	pluginService: PluginService,
): Promise<Plugin> {
	const newPlugin = clone(PluginSchema, plugin);
	newPlugin.isAvailable = false;

	const req = create(PluginRegisterRequestSchema, {
		host: plugin.host,
		port: plugin.port,
	});

	try {
		const resp = await pluginService.register(req);
		if (resp.info !== undefined) {
			newPlugin.info = resp.info;
			newPlugin.isAvailable = true;
		}
	} catch (e) {
		console.error(e);
	}

	return newPlugin;
}

export async function registerAllPluginsAndCheckAvailability(
	plugins: readonly Plugin[],
	pluginService: PluginService,
): Promise<Plugin[]> {
	return Promise.all(
		plugins.map((plugin) =>
			registerPluginAndCheckAvailability(plugin, pluginService),
		),
	);
}

export function removePluginFromState(
	pluginState: PluginState,
	host: string,
	port: number,
): PluginState | undefined {
	const index = pluginState.plugins.findIndex(
		(v) => v.host === host && v.port === port,
	);
	if (index < 0) {
		return undefined;
	}
	const newState = clone(PluginStateSchema, pluginState);
	newState.plugins.splice(index, 1);
	return newState;
}
