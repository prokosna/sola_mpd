import type { Plugin } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import { Plugin_PluginType } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";

export function filterAvailablePlugins(
	plugins: readonly Plugin[],
	pluginType: Plugin_PluginType,
): Plugin[] {
	return plugins.filter(
		(plugin) =>
			plugin.isAvailable &&
			(plugin.info?.supportedTypes.includes(Plugin_PluginType.ON_ALL) ||
				plugin.info?.supportedTypes.includes(pluginType)),
	);
}
