import { Plugin_PluginType } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";

import { useNotification } from "../../../lib/chakra/hooks/useNotification";
import { ContextMenuItem } from "../../context_menu";
import {
  getTargetSongsForContextMenu,
  SongTableContextMenuItemParams,
  SongTableKeyType,
} from "../../song_table";
import {
  useSetPluginExecutionPropsState,
  useSetIsPluginExecutionModalOpenState,
  useIsPreviousPluginStillRunningState,
} from "../states/executionState";
import { usePluginState } from "../states/pluginState";

/**
 * Custom hook to generate context menu items for plugins.
 *
 * @param pluginType - The type of plugin to generate menu items for.
 * @param songTableKeyType - The key type used in the song table.
 * @returns An array of ContextMenuItem objects for the specified plugin type.
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
