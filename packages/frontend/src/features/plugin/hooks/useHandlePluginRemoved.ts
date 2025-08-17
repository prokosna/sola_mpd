import { clone } from "@bufbuild/protobuf";
import {
	type Plugin,
	PluginStateSchema,
} from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { useCallback } from "react";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import { UpdateMode } from "../../../types/stateTypes";
import { usePluginState, useUpdatePluginState } from "../states/pluginState";

/**
 * Handle plugin removal.
 *
 * @param plugin Plugin to remove
 * @returns Remove handler
 */
export function useHandlePluginRemoved(plugin: Plugin) {
	const notify = useNotification();

	const pluginState = usePluginState();
	const updatePluginState = useUpdatePluginState();

	return useCallback(async () => {
		if (pluginState === undefined) {
			return;
		}
		const index = pluginState.plugins.findIndex(
			(v) => `${v.host}:${v.port}` === `${plugin.host}:${plugin.port}`,
		);
		if (index < 0) {
			return;
		}
		const newState = clone(PluginStateSchema, pluginState);
		newState.plugins.splice(index, 1);
		await updatePluginState(
			newState,
			UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
		);
		notify({
			status: "success",
			title: "Plugin successfully removed",
			description: `Plugin ${plugin.info?.name} has been removed.`,
		});
	}, [
		notify,
		plugin.host,
		plugin.info?.name,
		plugin.port,
		pluginState,
		updatePluginState,
	]);
}
