import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { RowDragEndEvent } from "ag-grid-community";
import { useCallback } from "react";

import { getSongsInTableFromGrid } from "../helpers/table";
import { SongTableKeyType } from "../types/songTable";

export function useOnRowDragEnd(
  keyType: SongTableKeyType,
  songsMap: Map<string, Song>,
  onReorderSongs: (orderedSongs: Song[]) => Promise<void>,
) {
  return useCallback(
    (event: RowDragEndEvent) => {
      const { api } = event;
      const { sortedSongs } = getSongsInTableFromGrid(keyType, api, songsMap);
      onReorderSongs(sortedSongs);
    },
    [keyType, songsMap, onReorderSongs],
  );
}
