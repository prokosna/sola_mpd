import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { RowDoubleClickedEvent } from "ag-grid-community";

import { getSongsInTableFromGrid } from "../workflows/convertAgGridTableSongs";

export function useOnRowDoubleClicked(
  songsMap: Map<string, Song>,
  addAndPlaySongAction: (clickedSong: Song, songs: Song[]) => Promise<void>,
) {
  return (event: RowDoubleClickedEvent) => {
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
    addAndPlaySongAction(clickedSong, sortedSongs);
  };
}
