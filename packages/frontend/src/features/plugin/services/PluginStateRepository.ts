import type { PluginState } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";

/**
 * Plugin state persistence.
 *
 * Handles storage and retrieval.
 */
export interface PluginStateRepository {
	/**
	 * Get current plugin state.
	 *
	 * @returns Current state
	 * @throws On retrieval failure
	 */
	fetch: () => Promise<PluginState>;

	/**
	 * Save current plugin state.
	 *
	 * @param state State to save
	 * @throws On save failure
	 */
	save: (pluginState: PluginState) => Promise<void>;
}
