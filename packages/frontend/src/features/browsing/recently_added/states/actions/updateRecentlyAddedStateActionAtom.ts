import type { RecentlyAddedState } from "@sola_mpd/shared/src/models/recently_added_pb.js";
import { atom } from "jotai";

import { showNotification } from "../../../../../lib/mantine/showNotification";
import { UpdateMode } from "../../../../../types/stateTypes";
import { recentlyAddedStateAsyncAtom } from "../atoms/recentlyAddedStateAtom";
import { recentlyAddedStateRepositoryAtom } from "../atoms/recentlyAddedStateRepositoryAtom";

export const updateRecentlyAddedStateActionAtom = atom(
	null,
	async (get, set, args: { state: RecentlyAddedState; mode: UpdateMode }) => {
		const { state, mode } = args;
		if (mode & UpdateMode.PERSIST) {
			try {
				await get(recentlyAddedStateRepositoryAtom).save(state);
			} catch (e) {
				console.error(e);
				showNotification({
					title: "Could not save recently-added state",
					description: e instanceof Error ? e.message : String(e),
					status: "error",
				});
				return;
			}
		}
		if (mode & UpdateMode.LOCAL_STATE) {
			set(recentlyAddedStateAsyncAtom, state);
		}
	},
);
