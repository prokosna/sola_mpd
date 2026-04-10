import type { RecentlyAddedState } from "@sola_mpd/shared/src/models/recently_added_pb.js";
import { atom } from "jotai";

import { UpdateMode } from "../../../../../types/stateTypes";
import { recentlyAddedStateAsyncAtom } from "../atoms/recentlyAddedStateAtom";
import { recentlyAddedStateRepositoryAtom } from "../atoms/recentlyAddedStateRepositoryAtom";

export const updateRecentlyAddedStateActionAtom = atom(
	null,
	async (get, set, args: { state: RecentlyAddedState; mode: UpdateMode }) => {
		const { state, mode } = args;
		if (mode & UpdateMode.LOCAL_STATE) {
			set(recentlyAddedStateAsyncAtom, state);
		}
		if (mode & UpdateMode.PERSIST) {
			await get(recentlyAddedStateRepositoryAtom).save(state);
		}
	},
);
