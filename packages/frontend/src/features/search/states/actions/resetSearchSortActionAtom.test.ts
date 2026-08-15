import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { createStore } from "jotai";
import { describe, expect, it } from "vitest";

import { EditingSearchStatus } from "../../types/searchTypes";
import {
	editingSearchStatusAtom,
	searchEditColumnsAtom,
} from "../atoms/searchEditAtom";

import { resetSearchSortActionAtom } from "./resetSearchSortActionAtom";

describe("resetSearchSortActionAtom", () => {
	it("clears the staged sort, leaves the column tags untouched, and marks the status as changed", () => {
		const store = createStore();
		store.set(searchEditColumnsAtom, {
			columnTags: [Song_MetadataTag.TITLE, Song_MetadataTag.ARTIST],
			sort: [{ tag: Song_MetadataTag.ARTIST, isDesc: true }],
		});

		store.set(resetSearchSortActionAtom);

		expect(store.get(searchEditColumnsAtom)).toEqual({
			columnTags: [Song_MetadataTag.TITLE, Song_MetadataTag.ARTIST],
			sort: [],
		});
		expect(store.get(editingSearchStatusAtom)).toBe(
			EditingSearchStatus.COLUMNS_UPDATED,
		);
	});

	it("does nothing when there is no staged override", () => {
		const store = createStore();

		store.set(resetSearchSortActionAtom);

		expect(store.get(searchEditColumnsAtom)).toBeUndefined();
		expect(store.get(editingSearchStatusAtom)).toBe(
			EditingSearchStatus.NOT_SAVED,
		);
	});
});
