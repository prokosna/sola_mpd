import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { createStore } from "jotai";
import { describe, expect, it } from "vitest";

import { EditingSearchStatus } from "../../types/searchTypes";
import {
	editingSearchStatusAtom,
	searchEditColumnsAtom,
} from "../atoms/searchEditAtom";

import { updateSearchColumnTagsActionAtom } from "./updateSearchColumnTagsActionAtom";

describe("updateSearchColumnTagsActionAtom", () => {
	it("stages the new tag order and keeps a sort whose tag survives", () => {
		const store = createStore();
		store.set(searchEditColumnsAtom, {
			columnTags: [Song_MetadataTag.TITLE, Song_MetadataTag.ARTIST],
			sort: [{ tag: Song_MetadataTag.ARTIST, isDesc: true }],
		});

		store.set(updateSearchColumnTagsActionAtom, [
			Song_MetadataTag.ARTIST,
			Song_MetadataTag.TITLE,
		]);

		expect(store.get(searchEditColumnsAtom)).toEqual({
			columnTags: [Song_MetadataTag.ARTIST, Song_MetadataTag.TITLE],
			sort: [{ tag: Song_MetadataTag.ARTIST, isDesc: true }],
		});
		expect(store.get(editingSearchStatusAtom)).toBe(
			EditingSearchStatus.COLUMNS_UPDATED,
		);
	});

	it("drops a sort whose tag is no longer among the columns", () => {
		const store = createStore();
		store.set(searchEditColumnsAtom, {
			columnTags: [Song_MetadataTag.TITLE, Song_MetadataTag.ALBUM],
			sort: [
				{ tag: Song_MetadataTag.ALBUM, isDesc: false },
				{ tag: Song_MetadataTag.TITLE, isDesc: true },
			],
		});

		store.set(updateSearchColumnTagsActionAtom, [Song_MetadataTag.TITLE]);

		expect(store.get(searchEditColumnsAtom)).toEqual({
			columnTags: [Song_MetadataTag.TITLE],
			sort: [{ tag: Song_MetadataTag.TITLE, isDesc: true }],
		});
	});
});
