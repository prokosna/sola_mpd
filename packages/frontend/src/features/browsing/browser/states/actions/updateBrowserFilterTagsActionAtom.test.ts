import { clone, create } from "@bufbuild/protobuf";
import {
	BrowserFilterSchema,
	BrowserStateSchema,
} from "@sola_mpd/shared/src/models/browser_pb.js";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";

import type { BrowserStateRepository } from "../../repositories/BrowserStateRepository";
import {
	browserStateAsyncAtom,
	browserStateAtom,
} from "../atoms/browserStateAtom";
import { browserStateRepositoryAtom } from "../atoms/browserStateRepositoryAtom";
import { updateBrowserFilterTagsActionAtom } from "./updateBrowserFilterTagsActionAtom";

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

function createFakeBrowserStateRepository(): BrowserStateRepository {
	return {
		fetch: vi.fn(async () => create(BrowserStateSchema, {})),
		save: vi.fn(async () => {}),
	};
}

describe("updateBrowserFilterTagsActionAtom", () => {
	it("clones the fetched document and sets only filter_tags, preserving the deprecated filters", async () => {
		const store = createStore();
		const browserStateRepository = createFakeBrowserStateRepository();
		store.set(browserStateRepositoryAtom, browserStateRepository);
		const initialState = create(BrowserStateSchema, {
			filterTags: [Song_MetadataTag.ARTIST],
			filters: [
				create(BrowserFilterSchema, { tag: Song_MetadataTag.ARTIST, order: 0 }),
			],
		});
		store.set(browserStateAsyncAtom, Promise.resolve(initialState));
		store.get(browserStateAtom); // primes the async->sync unwrap
		await flush();

		await store.set(updateBrowserFilterTagsActionAtom, [
			Song_MetadataTag.GENRE,
			Song_MetadataTag.ARTIST,
		]);

		// The deprecated filters array must survive untouched: the backend
		// save guard relies on it.
		const expectedState = clone(BrowserStateSchema, initialState);
		expectedState.filterTags = [
			Song_MetadataTag.GENRE,
			Song_MetadataTag.ARTIST,
		];
		expect(browserStateRepository.save).toHaveBeenCalledWith(expectedState);
		expect(store.get(browserStateAtom)?.filterTags).toEqual([
			Song_MetadataTag.GENRE,
			Song_MetadataTag.ARTIST,
		]);
	});

	it("does nothing when the server document has not loaded yet", async () => {
		const store = createStore();
		const browserStateRepository = createFakeBrowserStateRepository();
		store.set(browserStateRepositoryAtom, browserStateRepository);

		await store.set(updateBrowserFilterTagsActionAtom, [
			Song_MetadataTag.ARTIST,
		]);

		expect(browserStateRepository.save).not.toHaveBeenCalled();
	});
});
