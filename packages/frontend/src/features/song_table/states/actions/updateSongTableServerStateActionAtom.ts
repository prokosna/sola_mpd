import type { SongTableState } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { atom } from "jotai";

import { showNotification } from "../../../../lib/mantine/showNotification";
import { UpdateMode } from "../../../../types/stateTypes";
import { songTableStateAsyncAtom } from "../atoms/songTableAtom";
import { songTableStateRepositoryAtom } from "../atoms/songTableStateRepositoryAtom";

// No tag-diff gate, unlike updateSongTableStateActionAtom: the Raw Data editor
// is an escape hatch onto the genuine on-disk document, which only holds if a
// save here always reaches the server.
export const updateSongTableServerStateActionAtom = atom(
	null,
	async (get, set, params: { state: SongTableState; mode: UpdateMode }) => {
		const { state, mode } = params;
		if (mode & UpdateMode.PERSIST) {
			try {
				await get(songTableStateRepositoryAtom).save(state);
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
		if (mode & UpdateMode.LOCAL_STATE) {
			set(songTableStateAsyncAtom, state);
		}
	},
);
