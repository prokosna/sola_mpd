import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";

import { buildDeviceSortFromColumnViews } from "../../../song_table";
import { EditingSearchStatus } from "../../types/searchTypes";
import { searchColumnViewAtom } from "../atoms/searchColumnViewAtom";
import {
	editingSearchStatusAtom,
	searchEditColumnsAtom,
} from "../atoms/searchEditAtom";

/**
 * "Edit Columns" in Search: stages the new tag order into the
 * editor. The first edit of an as-yet-untouched search materializes the sort
 * it was showing (the shared library view) rather than discarding it, and a
 * sort on a dropped tag goes with the tag — nothing else would ever clear it.
 */
export const updateSearchColumnTagsActionAtom = atom(
	null,
	(get, set, tags: Song_MetadataTag[]) => {
		const current = get(searchEditColumnsAtom);
		const sort =
			current?.sort ??
			buildDeviceSortFromColumnViews(get(searchColumnViewAtom) ?? []);
		set(searchEditColumnsAtom, {
			columnTags: tags,
			sort: sort.filter((entry) => tags.includes(entry.tag)),
		});
		set(editingSearchStatusAtom, EditingSearchStatus.COLUMNS_UPDATED);
	},
);
