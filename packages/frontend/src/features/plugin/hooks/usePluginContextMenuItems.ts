import type { Plugin_PluginType } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";

import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import type { ContextMenuItem } from "../../context_menu";
import {
	type SongTableContextMenuItemParams,
	type SongTableKeyType,
	getTargetSongsForContextMenu,
} from "../../song_table";
import {
	useIsPreviousPluginStillRunningState,
	useSetIsPluginExecutionModalOpenState,
	useSetPluginExecutionPropsState,
} from "../states/executionState";
import { usePluginState } from "../states/pluginState";

/**
 * Get plugin context menu items.
 *
 * @param pluginType Target plugin type
 * @param songTableKeyType Table key type
 * @returns Menu items array
 */
export function usePluginContextMenuItems(
	pluginType: Plugin_PluginType,
	songTableKeyType: SongTableKeyType,
): ContextMenuItem<SongTableContextMenuItemParams>[] {
	const notify = useNotification();

	const pluginState = usePluginState();
	const isPreviousPluginStillRunning = useIsPreviousPluginStillRunningState();
	const setPluginExecutionProps = useSetPluginExecutionPropsState();
	const setIsPluginExecutionModalOpen = useSetIsPluginExecutionModalOpenState();

	const items: ContextMenuItem<SongTableContextMenuItemParams>[] = [];
	for (const plugin of pluginState?.plugins || []) {
		if (
			!plugin.isAvailable ||
			!plugin.info?.supportedTypes.includes(pluginType)
		) {
			continue;
		}
		items.push({
			name: plugin.info.contextMenuTitle,
			onClick: async (params?: SongTableContextMenuItemParams) => {
				if (params === undefined) {
					return;
				}
				if (isPreviousPluginStillRunning) {
					notify({
						status: "warning",
						title: "Previous plugin is still running",
						description: "Please wait until the previous plugin finishes.",
					});
					return;
				}
				const targetSongs = getTargetSongsForContextMenu(
					params,
					songTableKeyType,
				);
				if (targetSongs.length === 0) {
					return;
				}
				setPluginExecutionProps({
					plugin,
					songs: targetSongs,
				});
				setIsPluginExecutionModalOpen("start");
			},
		});
	}
	return items;
}
