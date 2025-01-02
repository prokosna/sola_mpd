import {
	PluginRegisterRequest,
	PluginState,
} from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { atomWithDefault, useResetAtom } from "jotai/utils";
import { useCallback } from "react";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { UpdateMode } from "../../../types/stateTypes";

import { pluginServiceAtom } from "./pluginServiceState";
import { pluginStateRepositoryAtom } from "./pluginStateRepository";

/**
 * Plugin state management.
 */
const pluginStateAtom = atomWithDefault<Promise<PluginState> | PluginState>(
	async (get) => {
		const repository = get(pluginStateRepositoryAtom);
		const pluginState = await repository.fetch();
		const pluginService = get(pluginServiceAtom);

		// Fetch the latest plugin info
		const plugins = pluginState.plugins;

		const newPlugins = await Promise.all(
			plugins.map(async (plugin) => {
				const newPlugin = plugin.clone();
				newPlugin.isAvailable = false;

				const req = new PluginRegisterRequest({
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

		return new PluginState({
			plugins: newPlugins,
		});
	},
);

const pluginStateSyncAtom = atomWithSync(pluginStateAtom);

/**
 * Get plugin state.
 *
 * @returns Current state
 */
export function usePluginState() {
	return useAtomValue(pluginStateSyncAtom);
}

/**
 * Refresh plugin state.
 *
 * @returns Refresh function
 */
export function useRefreshPluginState() {
	return useResetAtom(pluginStateAtom);
}

/**
 * Update plugin state.
 *
 * @returns Update function
 */
export function useUpdatePluginState() {
	const setPluginState = useSetAtom(pluginStateAtom);
	const repository = useAtomValue(pluginStateRepositoryAtom);

	return useCallback(
		async (pluginState: PluginState, mode: UpdateMode) => {
			if (mode & UpdateMode.LOCAL_STATE) {
				setPluginState(pluginState);
			}
			if (mode & UpdateMode.PERSIST) {
				await repository.save(pluginState);
			}
		},
		[repository, setPluginState],
	);
}
