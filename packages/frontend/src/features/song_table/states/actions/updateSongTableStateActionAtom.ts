import type { SongTableState } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { atom } from "jotai";

import { showNotification } from "../../../../lib/mantine/showNotification";
import { UpdateMode } from "../../../../types/stateTypes";
import { songTableStateAsyncAtom } from "../atoms/songTableAtom";
import { songTableStateRepositoryAtom } from "../atoms/songTableStateRepositoryAtom";

export const updateSongTableStateActionAtom = atom(
	null,
	async (get, set, params: { state: SongTableState; mode: UpdateMode }) => {
		if (params.mode & UpdateMode.PERSIST) {
			try {
				await get(songTableStateRepositoryAtom).save(params.state);
			} catch (e) {
				console.error(e);
				showNotification({
					title: "Could not save song table layout",
					description: e instanceof Error ? e.message : String(e),
					status: "error",
				});
				return;
			}
		}
		if (params.mode & UpdateMode.LOCAL_STATE) {
			set(songTableStateAsyncAtom, params.state);
		}
	},
);
