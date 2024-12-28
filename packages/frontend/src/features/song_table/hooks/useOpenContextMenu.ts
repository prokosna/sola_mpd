import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { CellContextMenuEvent } from "ag-grid-community";
import { useCallback } from "react";
import { TriggerEvent, useContextMenu } from "react-contexify";

import {
  SongTableContextMenuItemParams,
  SongTableKey,
  SongTableKeyType,
} from "../types/songTableTypes";
import {
  convertAgGridColumnsToSongTableColumns,
  copySortingAttributesToNewColumns,
} from "../utils/songTableColumnUtils";
import {
  getSongsInTableFromGrid,
  getSongTableKey,
} from "../utils/songTableTableUtils";

/**
 * Uses a callback function to open a context menu.
 * @param id String value to represent a page where opening a context menu.
 * @param keyType Type of a key represents a key field in a table.
 * @param songsMap Song key -> Song map.
 * @param columns Current columns.
 * @param isSortingEnabled True if sorting is enabled.
 * @returns Callback function to open a context menu.
 */
export function useOpenContextMenu(
  id: string,
  keyType: SongTableKeyType,
  songsMap: Map<SongTableKey, Song>,
  columns: SongTableColumn[],
  isSortingEnabled: boolean,
): (event: CellContextMenuEvent) => void {
  const contextMenu = useContextMenu({ id });
  return useCallback(
    (event: CellContextMenuEvent) => {
      const { api, data } = event;
      const targetSongKey: string | undefined = data?.key;
      if (targetSongKey == null) {
        return;
      }
      if (!event.event) {
        return;
      }

      const updatedColumns = convertAgGridColumnsToSongTableColumns(
        api.getAllGridColumns(),
      );
      const currentColumns = isSortingEnabled
        ? updatedColumns
        : copySortingAttributesToNewColumns(updatedColumns, columns);

      let { clickedSong, sortedSongs, selectedSortedSongs } =
        getSongsInTableFromGrid(targetSongKey, api, songsMap);

      if (clickedSong === undefined) {
        return;
      }

      // If a user selects only 1 single song, but opens the context menu
      // on another song, then the selected single song should be ignored.
      if (selectedSortedSongs.length === 1 && clickedSong !== undefined) {
        const firstKey = getSongTableKey(selectedSortedSongs[0], keyType);
        const targetKey = getSongTableKey(clickedSong, keyType);
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
