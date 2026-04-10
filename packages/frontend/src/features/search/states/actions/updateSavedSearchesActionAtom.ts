import type { SavedSearches } from "@sola_mpd/shared/src/models/search_pb.js";
import { atom } from "jotai";

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
		if (mode & UpdateMode.LOCAL_STATE) {
			set(savedSearchesAsyncAtom, savedSearches);
		}
		if (mode & UpdateMode.PERSIST) {
			await get(savedSearchesRepositoryAtom).save(savedSearches);
		}
	},
);
