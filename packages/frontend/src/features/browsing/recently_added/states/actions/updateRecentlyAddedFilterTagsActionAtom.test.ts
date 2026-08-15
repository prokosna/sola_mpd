import { clone, create } from "@bufbuild/protobuf";
import { RecentlyAddedStateSchema } from "@sola_mpd/shared/src/models/recently_added_pb.js";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";

import type { RecentlyAddedStateRepository } from "../../repositories/RecentlyAddedStateRepository";
import {
	recentlyAddedStateAsyncAtom,
	recentlyAddedStateAtom,
} from "../atoms/recentlyAddedStateAtom";
import { recentlyAddedStateRepositoryAtom } from "../atoms/recentlyAddedStateRepositoryAtom";
import { updateRecentlyAddedFilterTagsActionAtom } from "./updateRecentlyAddedFilterTagsActionAtom";

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

function createFakeRecentlyAddedStateRepository(): RecentlyAddedStateRepository {
	return {
		fetch: vi.fn(async () => create(RecentlyAddedStateSchema, {})),
		save: vi.fn(async () => {}),
	};
}

describe("updateRecentlyAddedFilterTagsActionAtom", () => {
	it("clones the fetched document and sets only filter_tags, preserving the deprecated filters", async () => {
		const store = createStore();
		const recentlyAddedStateRepository =
			createFakeRecentlyAddedStateRepository();
		store.set(recentlyAddedStateRepositoryAtom, recentlyAddedStateRepository);
		const initialState = create(RecentlyAddedStateSchema, {
			filterTags: [Song_MetadataTag.ARTIST],
			filters: [{ tag: Song_MetadataTag.ARTIST }],
		});
		store.set(recentlyAddedStateAsyncAtom, Promise.resolve(initialState));
		store.get(recentlyAddedStateAtom); // primes the async->sync unwrap
		await flush();

		await store.set(updateRecentlyAddedFilterTagsActionAtom, [
			Song_MetadataTag.GENRE,
			Song_MetadataTag.ARTIST,
		]);

		// The deprecated filters array must survive untouched: the backend
		// save guard relies on it.
		const expectedState = clone(RecentlyAddedStateSchema, initialState);
		expectedState.filterTags = [
			Song_MetadataTag.GENRE,
			Song_MetadataTag.ARTIST,
		];
		expect(recentlyAddedStateRepository.save).toHaveBeenCalledWith(
			expectedState,
		);
		expect(store.get(recentlyAddedStateAtom)?.filterTags).toEqual([
			Song_MetadataTag.GENRE,
			Song_MetadataTag.ARTIST,
		]);
	});

	it("does nothing when the server document has not loaded yet", async () => {
		const store = createStore();
		const recentlyAddedStateRepository =
			createFakeRecentlyAddedStateRepository();
		store.set(recentlyAddedStateRepositoryAtom, recentlyAddedStateRepository);

		await store.set(updateRecentlyAddedFilterTagsActionAtom, [
			Song_MetadataTag.ARTIST,
		]);

		expect(recentlyAddedStateRepository.save).not.toHaveBeenCalled();
	});
});
