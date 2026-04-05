import type { SongTableColumn } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { atom } from "jotai";

import { searchSongTableColumnsAtom } from "../atoms/searchEditAtom";

export const setSearchSongTableColumnsActionAtom = atom(
	null,
	(_get, set, columns: SongTableColumn[]) => {
		set(searchSongTableColumnsAtom, columns);
	},
);
