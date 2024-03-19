import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { RowDragEndEvent } from "ag-grid-community";
import { useCallback } from "react";

import { getSongsInTableFromGrid } from "../helpers/table";

export function useOnRowDragEnd(
  songsMap: Map<string, Song>,
  onReorderSongs: (orderedSongs: Song[]) => Promise<void>,
) {
  return useCallback(
    (event: RowDragEndEvent) => {
      const { api } = event;
      const { sortedSongs } = getSongsInTableFromGrid(undefined, api, songsMap);
      onReorderSongs(sortedSongs);
    },
    [songsMap, onReorderSongs],
  );
}
