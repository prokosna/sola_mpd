import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { RowDoubleClickedEvent } from "ag-grid-community";
import { useCallback } from "react";

import { getSongsInTableFromGrid } from "../helpers/table";

export function useOnRowDoubleClicked(
  songsMap: Map<string, Song>,
  onDoubleClick: (clickedSong: Song, songs: Song[]) => Promise<void>,
) {
  return useCallback(
    (event: RowDoubleClickedEvent) => {
      const { api, data } = event;
      const targetKey: string | undefined = data.key;
      if (targetKey == null) {
        return;
      }
      if (!event.event) {
        return;
      }

      const { clickedSong, sortedSongs } = getSongsInTableFromGrid(
        targetKey,
        api,
        songsMap,
      );
      if (clickedSong === undefined) {
        return;
      }
      onDoubleClick(clickedSong, sortedSongs);
    },
    [songsMap, onDoubleClick],
  );
}
