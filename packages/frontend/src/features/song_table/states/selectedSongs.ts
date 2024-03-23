import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

const selectedSongsAtom = atom<Song[]>([]);

export function useSelectedSongsState() {
  const selectedSongs = useAtomValue(selectedSongsAtom);
  return selectedSongs;
}

export function useSetSelectedSongsState() {
  const setSelectedSongs = useSetAtom(selectedSongsAtom);

  return useCallback(
    (songs: Song[]) => {
      setSelectedSongs(songs);
    },
    [setSelectedSongs],
  );
}
