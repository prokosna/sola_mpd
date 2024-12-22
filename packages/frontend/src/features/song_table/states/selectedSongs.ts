import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

const selectedSongsAtom = atom<Song[]>([]);

/**
 * Uses seleted songs at the current visible table.
 * @returns Selected songs.
 */
export function useSelectedSongsState(): Song[] {
  const selectedSongs = useAtomValue(selectedSongsAtom);
  return selectedSongs;
}

/**
 * Uses a function to set the current selected songs in the current visible table.
 * @returns Set function.
 */
export function useSetSelectedSongsState(): (songs: Song[]) => void {
  const setSelectedSongs = useSetAtom(selectedSongsAtom);

  return useCallback(
    (songs: Song[]) => {
      setSelectedSongs(songs);
    },
    [setSelectedSongs],
  );
}
