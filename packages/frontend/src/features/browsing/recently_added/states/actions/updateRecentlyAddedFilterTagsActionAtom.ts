import { clone } from "@bufbuild/protobuf";
import { RecentlyAddedStateSchema } from "@sola_mpd/shared/src/models/recently_added_pb.js";
import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";

import { UpdateMode } from "../../../../../types/stateTypes";
import { recentlyAddedStateAtom } from "../atoms/recentlyAddedStateAtom";
import { updateRecentlyAddedStateActionAtom } from "./updateRecentlyAddedStateActionAtom";

/**
 * The only writer of the Recently Added filter panel set. Clones the
 * fetched document and sets only `filter_tags`, which is what
 * keeps the deprecated `filters` the backend save-guard relies on intact —
 * never construct a fresh message here.
 */
export const updateRecentlyAddedFilterTagsActionAtom = atom(
	null,
	async (get, set, tags: Song_MetadataTag[]) => {
		const recentlyAddedState = get(recentlyAddedStateAtom);
		if (recentlyAddedState === undefined) {
			return;
		}

		const newState = clone(RecentlyAddedStateSchema, recentlyAddedState);
		newState.filterTags = tags;
		await set(updateRecentlyAddedStateActionAtom, {
			state: newState,
			mode: UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
		});
	},
);
