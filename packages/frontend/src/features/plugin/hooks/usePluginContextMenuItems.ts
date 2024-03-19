import { useToast } from "@chakra-ui/react";
import { Plugin_PluginType } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";

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
} from "../states/execution";
import { usePluginState } from "../states/persistent";

export function usePluginContextMenuItems(
  pluginType: Plugin_PluginType,
  songTableKeyType: SongTableKeyType,
): ContextMenuItem<SongTableContextMenuItemParams>[] {
  const toast = useToast();
  const pluginState = usePluginState();
  const setPluginExecutionProps = useSetPluginExecutionPropsState();
  const setIsPluginExecutionModalOpen = useSetIsPluginExecutionModalOpenState();
  const isPreviousPluginStillRunning = useIsPreviousPluginStillRunningState();

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
          toast({
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
