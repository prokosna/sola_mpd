import { clone } from "@bufbuild/protobuf";
import { BrowserStateSchema } from "@sola_mpd/shared/src/models/browser_pb.js";
import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";

import { UpdateMode } from "../../../../../types/stateTypes";
import { browserStateAtom } from "../atoms/browserStateAtom";
import { updateBrowserStateActionAtom } from "./updateBrowserStateActionAtom";

/**
 * The only writer of the Browser filter panel set. Clones the
 * fetched document and sets only `filter_tags`, which is what keeps the
 * deprecated `filters` the backend save-guard relies on intact — never
 * construct a fresh message here.
 */
export const updateBrowserFilterTagsActionAtom = atom(
	null,
	async (get, set, tags: Song_MetadataTag[]) => {
		const browserState = get(browserStateAtom);
		if (browserState === undefined) {
			return;
		}

		const newBrowserState = clone(BrowserStateSchema, browserState);
		newBrowserState.filterTags = tags;
		await set(updateBrowserStateActionAtom, {
			state: newBrowserState,
			mode: UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
		});
	},
);
