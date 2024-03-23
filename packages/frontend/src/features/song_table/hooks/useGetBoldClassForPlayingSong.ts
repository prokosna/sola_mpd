import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { RowClassParams } from "ag-grid-community";
import { useCallback, useMemo } from "react";

import { useCurrentSongState } from "../../player";
import { getTableKeyOfSong } from "../helpers/table";
import { SongTableKeyType, SongTableRowDataType } from "../types/songTable";

export function useGetBoldClassForPlayingSong(
  keyType: SongTableKeyType,
  songsMap: Map<string, Song>,
) {
  const currentSong = useCurrentSongState();

  const currentSongKey = useMemo(() => {
    if (currentSong === undefined) {
      return undefined;
    }

    return getTableKeyOfSong(currentSong, keyType);
  }, [currentSong, keyType]);

  return useCallback(
    (params: RowClassParams<SongTableRowDataType>) => {
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
    },
    [currentSongKey, keyType, songsMap],
  );
}
