import { clone, create } from "@bufbuild/protobuf";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import {
	SongTableColumnSchema,
	SongTableStateSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";
import { createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";

import type { SongTableStateRepository } from "../../repositories/SongTableStateRepository";
import {
	songTableServerStateAtom,
	songTableStateAsyncAtom,
} from "../atoms/songTableAtom";
import { songTableStateRepositoryAtom } from "../atoms/songTableStateRepositoryAtom";
import { updateSongTableColumnTagsActionAtom } from "./updateSongTableColumnTagsActionAtom";

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

function createFakeSongTableStateRepository(): SongTableStateRepository {
	return {
		fetch: vi.fn(async () => create(SongTableStateSchema, {})),
		save: vi.fn(async () => {}),
	};
}

describe("updateSongTableColumnTagsActionAtom", () => {
	it("clones the fetched document and sets only column_tags, preserving deprecated fields", async () => {
		const store = createStore();
		const songTableStateRepository = createFakeSongTableStateRepository();
		store.set(songTableStateRepositoryAtom, songTableStateRepository);
		const initialState = create(SongTableStateSchema, {
			columnTags: [Song_MetadataTag.TITLE],
			columns: [
				create(SongTableColumnSchema, {
					tag: Song_MetadataTag.TITLE,
					widthFlex: 250,
					sortOrder: 3,
					isSortDesc: true,
				}),
			],
		});
		store.set(songTableStateAsyncAtom, Promise.resolve(initialState));
		store.get(songTableServerStateAtom); // primes the async->sync unwrap
		await flush();

		await store.set(updateSongTableColumnTagsActionAtom, [
			Song_MetadataTag.ARTIST,
			Song_MetadataTag.TITLE,
		]);

		// The deprecated columns array must survive untouched: chunk 1's backend
		// save guard and the device migration both rely on it.
		const expectedState = clone(SongTableStateSchema, initialState);
		expectedState.columnTags = [
			Song_MetadataTag.ARTIST,
			Song_MetadataTag.TITLE,
		];
		expect(songTableStateRepository.save).toHaveBeenCalledWith(expectedState);
		expect(store.get(songTableServerStateAtom)?.columnTags).toEqual([
			Song_MetadataTag.ARTIST,
			Song_MetadataTag.TITLE,
		]);
	});

	it("does nothing when the server document has not loaded yet", async () => {
		const store = createStore();
		const songTableStateRepository = createFakeSongTableStateRepository();
		store.set(songTableStateRepositoryAtom, songTableStateRepository);

		await store.set(updateSongTableColumnTagsActionAtom, [
			Song_MetadataTag.TITLE,
		]);

		expect(songTableStateRepository.save).not.toHaveBeenCalled();
	});
});
