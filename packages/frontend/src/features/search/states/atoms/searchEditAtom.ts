import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";

import type { SongTableDeviceLayoutSort } from "../../../song_table";

import { EditingSearchStatus } from "../../types/searchTypes";
import { savedSearchesAtom } from "./savedSearchesAtom";

export const editingSearchStatusAtom = atom(EditingSearchStatus.NOT_SAVED);

export type SearchEditColumns = {
	columnTags: Song_MetadataTag[];
	sort: SongTableDeviceLayoutSort[];
};

/**
 * The in-progress edit for the search currently open in the editor:
 * `undefined` means "no override yet", so readers fall back to the shared
 * library column view until an edit (or loading a saved search) sets one.
 */
export const searchEditColumnsAtom = atom<SearchEditColumns | undefined>(
	undefined,
);

/** The name in the query editor, which the editor keeps up to date. */
export const editingSearchNameAtom = atom("");

/**
 * Which saved search the editor currently holds, if any. Derived from the name
 * being edited, so it follows renaming into and out of a saved search, and
 * saving or deleting one, without anything having to keep it in step.
 */
export const selectedSavedSearchNameAtom = atom((get) => {
	const savedSearches = get(savedSearchesAtom);
	const editingSearchName = get(editingSearchNameAtom);
	return savedSearches?.searches.some(
		(search) => search.name === editingSearchName,
	)
		? editingSearchName
		: undefined;
});
