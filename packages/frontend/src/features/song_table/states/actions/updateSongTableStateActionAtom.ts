import type { SongTableState } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { atom } from "jotai";

import { UpdateMode } from "../../../../types/stateTypes";
import { songTableStateAsyncAtom } from "../atoms/songTableAtom";
import { songTableStateRepositoryAtom } from "../atoms/songTableStateRepositoryAtom";

export const updateSongTableStateActionAtom = atom(
	null,
	async (get, set, params: { state: SongTableState; mode: UpdateMode }) => {
		if (params.mode & UpdateMode.LOCAL_STATE) {
			set(songTableStateAsyncAtom, params.state);
		}
		if (params.mode & UpdateMode.PERSIST) {
			const repository = get(songTableStateRepositoryAtom);
			await repository.save(params.state);
		}
	},
);
