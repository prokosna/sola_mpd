import { PluginState } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";

/**
 * Plugin state repository.
 */
export interface PluginStateRepository {
  fetch: () => Promise<PluginState>;
  save: (pluginState: PluginState) => Promise<void>;
}
