import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { SelectionChangedEvent } from "ag-grid-community";
import { useCallback } from "react";

import { getSongsInTableFromGrid } from "../helpers/table";

export function useOnSelectionChanged(
  songsMap: Map<string, Song>,
  onSelectSongs: (selectedSongs: Song[]) => Promise<void>,
) {
  return useCallback(
    (event: SelectionChangedEvent) => {
      const { api } = event;
      const { selectedSortedSongs } = getSongsInTableFromGrid(
        undefined,
        api,
        songsMap,
      );
      onSelectSongs(selectedSortedSongs);
    },
    [songsMap, onSelectSongs],
  );
}
