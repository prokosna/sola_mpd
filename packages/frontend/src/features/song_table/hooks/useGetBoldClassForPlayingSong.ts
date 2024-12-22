import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { RowClassParams } from "ag-grid-community";
import { useCallback, useMemo } from "react";

import { useCurrentSongState } from "../../player";
import {
  SongTableKey,
  SongTableKeyType,
  SongTableRowData,
} from "../types/songTableTypes";
import { getSongTableKey } from "../utils/tableUtils";

/**
 * Uses a callback to get a bold text CSS class if a given row is in playing.
 * @param keyType Song table key type.
 * @param songsMap Songs map.
 * @returns Bold text CSS class string or undefined.
 */
export function useGetBoldClassForPlayingSong(
  keyType: SongTableKeyType,
  songsMap: Map<SongTableKey, Song>,
): (params: RowClassParams<SongTableRowData>) => string | undefined {
  const currentSong = useCurrentSongState();

  const currentSongKey = useMemo(() => {
    if (currentSong === undefined) {
      return undefined;
    }

    return getSongTableKey(currentSong, keyType);
  }, [currentSong, keyType]);

  return useCallback(
    (params: RowClassParams<SongTableRowData>) => {
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

      const rowKey = getSongTableKey(targetSong, keyType);
      if (rowKey === currentSongKey) {
        return "ag-font-weight-bold";
      }
      return;
    },
    [currentSongKey, keyType, songsMap],
  );
}
