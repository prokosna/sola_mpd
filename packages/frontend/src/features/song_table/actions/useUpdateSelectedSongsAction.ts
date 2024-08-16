import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { useSetAtom } from "jotai";

import { selectedSongsAtom } from "../atoms/selectedSongs";

export function useUpdateSelectedSongsAction() {
  const setSelectedSongs = useSetAtom(selectedSongsAtom);

  return async (newSelectedSongs: Song[]) => {
    setSelectedSongs(newSelectedSongs);
  };
}
