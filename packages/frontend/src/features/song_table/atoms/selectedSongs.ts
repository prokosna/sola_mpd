import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { atom } from "jotai";

export const selectedSongsAtom = atom<Song[]>([]);
