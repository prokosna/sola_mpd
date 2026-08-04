import { create } from "@bufbuild/protobuf";
import { BrowserFilterSchema } from "@sola_mpd/shared/src/models/browser_pb.js";
import {
	type RecentlyAddedState,
	RecentlyAddedStateSchema,
} from "@sola_mpd/shared/src/models/recently_added_pb.js";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";

import type { RecentlyAddedStateRepository } from "../../repositories/RecentlyAddedStateRepository";
import {
	recentlyAddedStateAsyncAtom,
	recentlyAddedStateAtom,
} from "../atoms/recentlyAddedStateAtom";
import { recentlyAddedStateRepositoryAtom } from "../atoms/recentlyAddedStateRepositoryAtom";

import { updateRecentlyAddedBrowserFiltersActionAtom } from "./updateRecentlyAddedBrowserFiltersActionAtom";

function createFakeRecentlyAddedStateRepository(): RecentlyAddedStateRepository {
	return {
		fetch: vi.fn(async () => create(RecentlyAddedStateSchema, {})),
		save: vi.fn(async () => {}),
	};
}

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

// The action is handed `BrowserFilter`s (the shared browsing type), while the
// server document stores `RecentlyAddedFilter`s, which carry only a tag.
function createFilter(
	tag: Song_MetadataTag,
	order: number,
	selectedValues: string[] = [],
) {
	return create(BrowserFilterSchema, {
		tag,
		order,
		selectedOrder: selectedValues.length > 0 ? 1 : -1,
		selectedValues: selectedValues.map((value) => ({
			value: { case: "stringValue" as const, value: { value } },
		})),
	});
}

async function createReadyStore(initial: RecentlyAddedState) {
	const store = createStore();
	const recentlyAddedStateRepository = createFakeRecentlyAddedStateRepository();
	store.set(recentlyAddedStateRepositoryAtom, recentlyAddedStateRepository);
	store.set(recentlyAddedStateAsyncAtom, Promise.resolve(initial));
	store.get(recentlyAddedStateAtom); // primes the async->sync unwrap
	await flush();
	return { store, recentlyAddedStateRepository };
}

describe("updateRecentlyAddedBrowserFiltersActionAtom", () => {
	it("does not persist to the server when only the selection changes", async () => {
		const initial = create(RecentlyAddedStateSchema, {
			filters: [
				{ tag: Song_MetadataTag.ARTIST },
				{ tag: Song_MetadataTag.ALBUM },
			],
		});
		const { store, recentlyAddedStateRepository } =
			await createReadyStore(initial);

		await store.set(updateRecentlyAddedBrowserFiltersActionAtom, [
			createFilter(Song_MetadataTag.ARTIST, 0, ["Beatles"]),
			createFilter(Song_MetadataTag.ALBUM, 1),
		]);

		expect(recentlyAddedStateRepository.save).not.toHaveBeenCalled();
	});

	it("persists tag/order to the server, with selection stripped, when the structure changes", async () => {
		const initial = create(RecentlyAddedStateSchema, {
			filters: [
				{ tag: Song_MetadataTag.ARTIST },
				{ tag: Song_MetadataTag.ALBUM },
			],
		});
		const { store, recentlyAddedStateRepository } =
			await createReadyStore(initial);

		await store.set(updateRecentlyAddedBrowserFiltersActionAtom, [
			createFilter(Song_MetadataTag.GENRE, 0, ["Rock"]),
			createFilter(Song_MetadataTag.ALBUM, 1),
		]);

		expect(recentlyAddedStateRepository.save).toHaveBeenCalledTimes(1);
		const saved = (
			recentlyAddedStateRepository.save as ReturnType<typeof vi.fn>
		).mock.calls[0][0] as RecentlyAddedState;
		expect(saved.filters.map((filter) => filter.tag)).toEqual([
			Song_MetadataTag.GENRE,
			Song_MetadataTag.ALBUM,
		]);
	});
});
