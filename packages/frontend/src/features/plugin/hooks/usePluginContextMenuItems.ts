import type { Plugin_PluginType } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import type { ContextMenuItem } from "../../context_menu";
import {
	getTargetSongsForContextMenu,
	type SongTableContextMenuItemParams,
	type SongTableKeyType,
} from "../../song_table";
import { filterAvailablePlugins } from "../functions/pluginFiltering";
import { pluginAtom } from "../states/atoms/pluginAtom";
import {
	isPreviousPluginStillRunningAtom,
	pluginExecutionModalOpenAtom,
	pluginExecutionPropsAtom,
} from "../states/atoms/pluginExecutionAtom";

export function usePluginContextMenuItems(
	pluginType: Plugin_PluginType,
	songTableKeyType: SongTableKeyType,
): ContextMenuItem<SongTableContextMenuItemParams>[] {
	const notify = useNotification();

	const pluginState = useAtomValue(pluginAtom);
	const isPreviousPluginStillRunning = useAtomValue(
		isPreviousPluginStillRunningAtom,
	);
	const setPluginExecutionProps = useSetAtom(pluginExecutionPropsAtom);
	const setIsPluginExecutionModalOpen = useSetAtom(
		pluginExecutionModalOpenAtom,
	);

	const availablePlugins = filterAvailablePlugins(
		pluginState?.plugins ?? [],
		pluginType,
	);

	return availablePlugins.map((plugin) => ({
		name: plugin.info?.contextMenuTitle ?? "",
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
	}));
}
