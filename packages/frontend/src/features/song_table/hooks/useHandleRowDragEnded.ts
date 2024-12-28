import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { RowDragEndEvent } from "ag-grid-community";
import { useCallback } from "react";

import { SongTableKey } from "../types/songTableTypes";
import { getSongsInTableFromGrid } from "../utils/songTableTableUtils";

/**
 * Uses a callback function on row drag ended.
 * @param songsMap Song key -> Songs mapping.
 * @param onSongsReordered Callback function on songs reordered.
 * @returns Callback function.
 */
export function useHandleRowDragEnded(
  songsMap: Map<SongTableKey, Song>,
  onSongsReordered: (orderedSongs: Song[]) => Promise<void>,
): (event: RowDragEndEvent) => void {
  return useCallback(
    (event: RowDragEndEvent) => {
      const { api } = event;
      const { sortedSongs } = getSongsInTableFromGrid(undefined, api, songsMap);
      onSongsReordered(sortedSongs);
    },
    [songsMap, onSongsReordered],
  );
}
