import type { SongTableColumn } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { atom } from "jotai";

import { EditingSearchStatus } from "../../types/searchTypes";

export const editingSearchStatusAtom = atom(EditingSearchStatus.NOT_SAVED);

export const searchSongTableColumnsAtom = atom<SongTableColumn[]>([]);
