import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { RowDragEndEvent } from "ag-grid-community";

import { getSongsInTableFromGrid } from "../workflows/convertAgGridTableSongs";

export function useOnRowDragEnd(
  songsMap: Map<string, Song>,
  reorderSongsAction: (orderedSongs: Song[]) => Promise<void>,
) {
  return (event: RowDragEndEvent) => {
    const { api } = event;
    const { sortedSongs } = getSongsInTableFromGrid(undefined, api, songsMap);
    reorderSongsAction(sortedSongs);
  };
}
