import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";

export const selectedSongsAtom = atom<Song[]>([]);
