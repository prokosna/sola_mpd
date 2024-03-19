import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { CellContextMenuEvent } from "ag-grid-community";
import { useCallback } from "react";
import { TriggerEvent, useContextMenu } from "react-contexify";

import { convertAgGridColumnsToSongTableColumns } from "../helpers/columns";
import { getSongsInTableFromGrid, getTableKeyOfSong } from "../helpers/table";
import {
  SongTableContextMenuItemParams,
  SongTableKeyType,
} from "../types/songTable";

export function useOnOpenContextMenu(
  id: string,
  keyType: SongTableKeyType,
  songsMap: Map<string, Song>,
  columns: SongTableColumn[],
  isSortingEnabled: boolean,
) {
  const contextMenu = useContextMenu({ id });
  return useCallback(
    (event: CellContextMenuEvent) => {
      const { api, data } = event;
      const targetKey: string | undefined = data?.key;
      if (targetKey == null) {
        return;
      }
      if (!event.event) {
        return;
      }

      const currentColumns = convertAgGridColumnsToSongTableColumns(
        api.getAllGridColumns(),
      );
      if (!isSortingEnabled) {
        for (const currentColumn of currentColumns) {
          const index = columns.findIndex(
            (column) => column.tag === currentColumn.tag,
          );
          if (index >= 0) {
            currentColumn.sortOrder = columns[index].sortOrder;
            currentColumn.isSortDesc = columns[index].isSortDesc;
          }
        }
      }

      let { clickedSong, sortedSongs, selectedSortedSongs } =
        getSongsInTableFromGrid(targetKey, api, songsMap);

      if (clickedSong === undefined) {
        return;
      }

      // If a user selects only 1 single song, but opens the context menu
      // on another song, then the selected single song should be ignored.
      if (selectedSortedSongs.length === 1 && clickedSong !== undefined) {
        const firstKey = getTableKeyOfSong(selectedSortedSongs[0], keyType);
        const targetKey = getTableKeyOfSong(clickedSong, keyType);
        if (firstKey !== targetKey) {
          selectedSortedSongs = [];
        }
      }

      const props: SongTableContextMenuItemParams = {
        columns: currentColumns,
        clickedSong,
        sortedSongs,
        selectedSortedSongs,
      };

      contextMenu.show({
        event: event.event as TriggerEvent,
        props,
      });
    },
    [columns, contextMenu, isSortingEnabled, keyType, songsMap],
  );
}
