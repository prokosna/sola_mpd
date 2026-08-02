import { create } from "@bufbuild/protobuf";
import {
	BrowserFilterSchema,
	type BrowserState,
	BrowserStateSchema,
} from "@sola_mpd/shared/src/models/browser_pb.js";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";

import { UpdateMode } from "../../../../../types/stateTypes";
import type { BrowserStateRepository } from "../../repositories/BrowserStateRepository";
import {
	browserStateAsyncAtom,
	browserStateAtom,
} from "../atoms/browserStateAtom";
import { browserStateRepositoryAtom } from "../atoms/browserStateRepositoryAtom";

import { updateBrowserFiltersActionAtom } from "./updateBrowserFiltersActionAtom";

function createFakeBrowserStateRepository(): BrowserStateRepository {
	return {
		fetch: vi.fn(async () => create(BrowserStateSchema, {})),
		save: vi.fn(async () => {}),
	};
}

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

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

async function createReadyStore(initial: BrowserState) {
	const store = createStore();
	const browserStateRepository = createFakeBrowserStateRepository();
	store.set(browserStateRepositoryAtom, browserStateRepository);
	store.set(browserStateAsyncAtom, Promise.resolve(initial));
	store.get(browserStateAtom); // primes the async->sync unwrap
	await flush();
	return { store, browserStateRepository };
}

describe("updateBrowserFiltersActionAtom", () => {
	it("does not persist to the server when only the selection changes", async () => {
		const initial = create(BrowserStateSchema, {
			filters: [
				createFilter(Song_MetadataTag.ARTIST, 0),
				createFilter(Song_MetadataTag.ALBUM, 1),
			],
		});
		const { store, browserStateRepository } = await createReadyStore(initial);

		const newFilters = [
			createFilter(Song_MetadataTag.ARTIST, 0, ["Beatles"]),
			createFilter(Song_MetadataTag.ALBUM, 1),
		];

		await store.set(updateBrowserFiltersActionAtom, {
			filters: newFilters,
			mode: UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
		});

		expect(browserStateRepository.save).not.toHaveBeenCalled();
	});

	it("persists tag/order to the server, with selection stripped, when the structure changes", async () => {
		const initial = create(BrowserStateSchema, {
			filters: [
				createFilter(Song_MetadataTag.ARTIST, 0),
				createFilter(Song_MetadataTag.ALBUM, 1),
			],
		});
		const { store, browserStateRepository } = await createReadyStore(initial);

		const newFilters = [
			createFilter(Song_MetadataTag.GENRE, 0, ["Rock"]),
			createFilter(Song_MetadataTag.ALBUM, 1),
		];

		await store.set(updateBrowserFiltersActionAtom, {
			filters: newFilters,
			mode: UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
		});

		expect(browserStateRepository.save).toHaveBeenCalledTimes(1);
		const saved = (browserStateRepository.save as ReturnType<typeof vi.fn>).mock
			.calls[0][0] as BrowserState;
		expect(saved.filters.map((f) => f.tag)).toEqual([
			Song_MetadataTag.GENRE,
			Song_MetadataTag.ALBUM,
		]);
		for (const filter of saved.filters) {
			expect(filter.selectedValues).toHaveLength(0);
			expect(filter.selectedOrder).toBe(-1);
		}
	});
});
