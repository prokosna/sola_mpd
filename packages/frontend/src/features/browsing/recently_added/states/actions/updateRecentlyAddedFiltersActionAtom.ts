import { clone, create } from "@bufbuild/protobuf";
import type { BrowserFilter } from "@sola_mpd/shared/src/models/browser_pb.js";
import {
	RecentlyAddedFilterSchema,
	RecentlyAddedStateSchema,
} from "@sola_mpd/shared/src/models/recently_added_pb.js";
import { atom } from "jotai";

import { UpdateMode } from "../../../../../types/stateTypes";
import { recentlyAddedStateAtom } from "../atoms/recentlyAddedStateAtom";
import { updateRecentlyAddedStateActionAtom } from "./updateRecentlyAddedStateActionAtom";

// Persists only the tag configuration to the server; selection is a
// navigation position and now lives in the URL
// — see hooks/useUpdateRecentlyAddedFilters.ts, which handles that side and
// calls this action for the structural half of every filter change.
export const updateRecentlyAddedFiltersActionAtom = atom(
	null,
	async (get, set, filters: BrowserFilter[]) => {
		const recentlyAddedState = get(recentlyAddedStateAtom);
		if (recentlyAddedState === undefined) {
			return;
		}

		const newTags = filters.map((filter) => filter.tag);
		const currentTags = recentlyAddedState.filters.map((filter) => filter.tag);
		const tagsChanged =
			newTags.length !== currentTags.length ||
			newTags.some((tag, index) => tag !== currentTags[index]);
		if (!tagsChanged) {
			// A pure selection change: nothing structural to persist.
			return;
		}

		const newState = clone(RecentlyAddedStateSchema, recentlyAddedState);
		newState.filters = filters.map((filter) =>
			create(RecentlyAddedFilterSchema, { tag: filter.tag }),
		);
		await set(updateRecentlyAddedStateActionAtom, {
			state: newState,
			mode: UpdateMode.PERSIST,
		});
	},
);
