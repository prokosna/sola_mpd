import type { SavedSearches } from "@sola_mpd/shared/src/models/search_pb.js";
import { atom } from "jotai";

import { showNotification } from "../../../../lib/mantine/showNotification";
import { UpdateMode } from "../../../../types/stateTypes";
import { savedSearchesAsyncAtom } from "../atoms/savedSearchesAtom";
import { savedSearchesRepositoryAtom } from "../atoms/savedSearchesRepositoryAtom";

export const updateSavedSearchesActionAtom = atom(
	null,
	async (
		get,
		set,
		args: { savedSearches: SavedSearches; mode: UpdateMode },
	) => {
		const { savedSearches, mode } = args;
		if (mode & UpdateMode.PERSIST) {
			try {
				await get(savedSearchesRepositoryAtom).save(savedSearches);
			} catch (e) {
				console.error(e);
				showNotification({
					title: "Could not save searches",
					description: e instanceof Error ? e.message : String(e),
					status: "error",
				});
				return;
			}
		}
		if (mode & UpdateMode.LOCAL_STATE) {
			set(savedSearchesAsyncAtom, savedSearches);
		}
	},
);
