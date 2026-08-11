import { create } from "@bufbuild/protobuf";
import type { PluginState } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import { PluginStateSchema } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { Getter } from "jotai";
import { atomWithDefault } from "jotai/utils";

import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import { showNotification } from "../../../../lib/mantine/showNotification";
import { registerAllPluginsAndCheckAvailability } from "../../functions/pluginRegistration";

import { pluginServiceAtom } from "./pluginServiceAtom";
import { pluginStateRepositoryAtom } from "./pluginStateRepositoryAtom";

// Registration and availability checks have to run again on every refetch: a
// peer's config-changed broadcast can mean the plugin list itself changed.
export async function loadPluginState(get: Getter): Promise<PluginState> {
	const repository = get(pluginStateRepositoryAtom);
	const pluginState = await repository.fetch();
	const pluginService = get(pluginServiceAtom);

	const newPlugins = await registerAllPluginsAndCheckAvailability(
		pluginState.plugins,
		pluginService,
		({ host, port, error }) => {
			showNotification({
				title: "Plugin unavailable",
				description: `Could not reach plugin ${host}:${port}: ${error instanceof Error ? error.message : String(error)}`,
				status: "error",
			});
		},
	);

	return create(PluginStateSchema, {
		plugins: newPlugins,
	});
}

export const pluginAsyncAtom = atomWithDefault<
	Promise<PluginState> | PluginState
>(loadPluginState);

export const pluginAtom = atomWithSync(pluginAsyncAtom);
