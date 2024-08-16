import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { SelectionChangedEvent } from "ag-grid-community";

import { getSongsInTableFromGrid } from "../workflows/convertAgGridTableSongs";

export function useOnSelectionChanged(
  songsMap: Map<string, Song>,
  selectSongsAction: (selectedSongs: Song[]) => Promise<void>,
) {
  return (event: SelectionChangedEvent) => {
    const { api } = event;
    const { selectedSortedSongs } = getSongsInTableFromGrid(
      undefined,
      api,
      songsMap,
    );
    selectSongsAction(selectedSortedSongs);
  };
}
