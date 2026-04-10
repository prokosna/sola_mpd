import { clone, create } from "@bufbuild/protobuf";
import type { BrowserFilter } from "@sola_mpd/shared/src/models/browser_pb.js";
import {
	RecentlyAddedFilterSchema,
	RecentlyAddedStateSchema,
} from "@sola_mpd/shared/src/models/recently_added_pb.js";
import { atom } from "jotai";

import { UpdateMode } from "../../../../../types/stateTypes";
import { recentlyAddedBrowserFiltersAtom } from "../atoms/recentlyAddedFiltersAtom";
import { recentlyAddedStateAtom } from "../atoms/recentlyAddedStateAtom";
import { updateRecentlyAddedStateActionAtom } from "./updateRecentlyAddedStateActionAtom";

export const updateRecentlyAddedBrowserFiltersActionAtom = atom(
	null,
	async (get, set, filters: BrowserFilter[]) => {
		const recentlyAddedState = get(recentlyAddedStateAtom);
		if (recentlyAddedState === undefined) {
			return;
		}
		set(recentlyAddedBrowserFiltersAtom, filters);
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
