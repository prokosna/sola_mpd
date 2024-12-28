import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { SelectionChangedEvent } from "ag-grid-community";
import { useCallback } from "react";

import { SongTableKey } from "../types/songTableTypes";
import { getSongsInTableFromGrid } from "../utils/songTableTableUtils";

/**
 * Uses a callback function on selection changed.
 * @param songsMap Song key -> Song mapping.
 * @param onSongsSelected Callback function to select songs.
 * @returns Callback function.
 */
export function useHandleSelectionChange(
  songsMap: Map<SongTableKey, Song>,
  onSongsSelected: (selectedSongs: Song[]) => Promise<void>,
): (event: SelectionChangedEvent) => void {
  return useCallback(
    (event: SelectionChangedEvent) => {
      const { api } = event;
      const { selectedSortedSongs } = getSongsInTableFromGrid(
        undefined,
        api,
        songsMap,
      );
      onSongsSelected(selectedSortedSongs);
    },
    [songsMap, onSongsSelected],
  );
}
