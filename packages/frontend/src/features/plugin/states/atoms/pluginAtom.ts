import { clone, create } from "@bufbuild/protobuf";
import type { PluginState } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import {
	PluginRegisterRequestSchema,
	PluginSchema,
	PluginStateSchema,
} from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import { atomWithDefault } from "jotai/utils";

import { atomWithSync } from "../../../../lib/jotai/atomWithSync";

import { pluginServiceAtom } from "./pluginServiceAtom";
import { pluginStateRepositoryAtom } from "./pluginStateRepositoryAtom";

export const pluginAsyncAtom = atomWithDefault<
	Promise<PluginState> | PluginState
>(async (get) => {
	const repository = get(pluginStateRepositoryAtom);
	const pluginState = await repository.fetch();
	const pluginService = get(pluginServiceAtom);

	const plugins = pluginState.plugins;

	const newPlugins = await Promise.all(
		plugins.map(async (plugin) => {
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
		}),
	);

	return create(PluginStateSchema, {
		plugins: newPlugins,
	});
});

export const pluginAtom = atomWithSync(pluginAsyncAtom);
