import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { SelectionChangedEvent } from "ag-grid-community";
import { useCallback } from "react";

import { getSongsInTableFromGrid } from "../helpers/table";
import { SongTableKeyType } from "../types/songTable";

export function useOnSelectionChanged(
  keyType: SongTableKeyType,
  songsMap: Map<string, Song>,
  onSelectSongs: (selectedSongs: Song[]) => Promise<void>,
) {
  return useCallback(
    (event: SelectionChangedEvent) => {
      const { api } = event;
      const { selectedSortedSongs } = getSongsInTableFromGrid(
        keyType,
        api,
        songsMap,
      );
      onSelectSongs(selectedSortedSongs);
    },
    [keyType, songsMap, onSelectSongs],
  );
}
