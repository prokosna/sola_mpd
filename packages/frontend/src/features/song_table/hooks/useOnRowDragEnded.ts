import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { RowDragEndEvent } from "ag-grid-community";
import { useCallback } from "react";

import { SongTableKey } from "../types/songTableTypes";
import { getSongsInTableFromGrid } from "../utils/tableUtils";

/**
 * Uses a callback function on row drag ended.
 * @param songsMap Song key -> Songs mapping.
 * @param onReorderSongs Callback function on songs reordered.
 * @returns Callback function.
 */
export function useOnRowDragEnded(
  songsMap: Map<SongTableKey, Song>,
  onReorderSongs: (orderedSongs: Song[]) => Promise<void>,
): (event: RowDragEndEvent) => void {
  return useCallback(
    (event: RowDragEndEvent) => {
      const { api } = event;
      const { sortedSongs } = getSongsInTableFromGrid(undefined, api, songsMap);
      onReorderSongs(sortedSongs);
    },
    [songsMap, onReorderSongs],
  );
}
