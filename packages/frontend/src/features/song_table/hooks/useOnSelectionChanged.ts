import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { SelectionChangedEvent } from "ag-grid-community";
import { useCallback } from "react";

import { SongTableKey } from "../types/songTableTypes";
import { getSongsInTableFromGrid } from "../utils/tableUtils";

/**
 * Uses a callback function on selection changed.
 * @param songsMap Song key -> Song mapping.
 * @param onSelectSongs Callback function to select songs.
 * @returns Callback function.
 */
export function useOnSelectionChanged(
  songsMap: Map<SongTableKey, Song>,
  onSelectSongs: (selectedSongs: Song[]) => Promise<void>,
): (event: SelectionChangedEvent) => void {
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
