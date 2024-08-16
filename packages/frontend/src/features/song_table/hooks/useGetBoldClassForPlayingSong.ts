import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { RowClassParams } from "ag-grid-community";

import { SongTableKeyType, SongTableRowData } from "../types/songTableTypes";
import { getTableKeyOfSong } from "../workflows/convertAgGridTableSongs";

export function useGetBoldClassForPlayingSong(
  currentSong: Song | undefined,
  keyType: SongTableKeyType,
  songsMap: Map<string, Song>,
) {
  const currentSongKey = currentSong
    ? getTableKeyOfSong(currentSong, keyType)
    : undefined;

  return (params: RowClassParams<SongTableRowData>) => {
    if (params.data === undefined) {
      return;
    }

    const targetKey = params.data.key;
    if (targetKey === undefined) {
      return;
    }

    const targetSong = songsMap.get(String(targetKey));
    if (targetSong === undefined) {
      return;
    }

    const rowKey = getTableKeyOfSong(targetSong, keyType);
    if (rowKey === currentSongKey) {
      return "ag-font-weight-bold";
    }
    return;
  };
}
