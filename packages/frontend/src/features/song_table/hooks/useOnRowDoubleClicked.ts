import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { RowDoubleClickedEvent } from "ag-grid-community";
import { useCallback } from "react";

import { SongTableKey } from "../types/songTableTypes";
import { getSongsInTableFromGrid } from "../utils/tableUtils";

/**
 * Uses a callback function on row double clicked.
 * @param songsMap Song key -> Song mapping.
 * @param onDoubleClick Callback function on double click.
 * @returns Callback function.
 */
export function useOnRowDoubleClicked(
  songsMap: Map<SongTableKey, Song>,
  onDoubleClick: (clickedSong: Song, songs: Song[]) => Promise<void>,
): (event: RowDoubleClickedEvent) => void {
  return useCallback(
    (event: RowDoubleClickedEvent) => {
      const { api, data } = event;
      const targetKey: string | undefined = data.key;
      if (targetKey == null) {
        return;
      }
      if (!event.event) {
        return;
      }

      const { clickedSong, sortedSongs } = getSongsInTableFromGrid(
        targetKey,
        api,
        songsMap,
      );
      if (clickedSong === undefined) {
        return;
      }
      onDoubleClick(clickedSong, sortedSongs);
    },
    [songsMap, onDoubleClick],
  );
}
