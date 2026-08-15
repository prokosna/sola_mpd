import { create } from "@bufbuild/protobuf";
import {
	SavedSearchesSchema,
	SearchSchema,
} from "@sola_mpd/shared/src/models/search_pb.js";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { SongTableStateSchema } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { createStore } from "jotai";
import { describe, expect, it } from "vitest";

import type { DeviceSettingsRepository } from "../../../common";
import { deviceSettingsRepositoryAtom } from "../../../common";
import type { SongTableStateRepository } from "../../../song_table/repositories/SongTableStateRepository";
import { songTableDeviceLayoutAtom } from "../../../song_table/states/atoms/songTableDeviceLayoutAtom";
import { songTableStateRepositoryAtom } from "../../../song_table/states/atoms/songTableStateRepositoryAtom";
import { savedSearchesAsyncAtom } from "./savedSearchesAtom";
import { searchColumnViewAtom } from "./searchColumnViewAtom";
import {
	editingSearchNameAtom,
	searchEditColumnsAtom,
	selectedSavedSearchNameAtom,
} from "./searchEditAtom";

function createFakeDeviceSettingsRepository(): DeviceSettingsRepository {
	const backing = new Map<string, unknown>();
	return {
		get: (<T>(key: string, defaultValue?: T) =>
			backing.has(key)
				? (backing.get(key) as T)
				: defaultValue) as DeviceSettingsRepository["get"],
		set: (<T>(key: string, value: T) => {
			backing.set(key, value);
		}) as DeviceSettingsRepository["set"],
		remove: (key: string) => {
			backing.delete(key);
		},
		listKeys: (prefix: string) =>
			[...backing.keys()].filter((key) => key.startsWith(prefix)),
	};
}

function createFakeSongTableStateRepository(): SongTableStateRepository {
	return {
		fetch: async () => create(SongTableStateSchema, {}),
		save: async () => {},
	};
}

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

async function createReadyStore(savedSearchNames: string[]) {
	const store = createStore();
	store.set(deviceSettingsRepositoryAtom, createFakeDeviceSettingsRepository());
	store.set(songTableStateRepositoryAtom, createFakeSongTableStateRepository());
	store.set(
		savedSearchesAsyncAtom,
		Promise.resolve(
			create(SavedSearchesSchema, {
				searches: savedSearchNames.map((name) =>
					create(SearchSchema, { name }),
				),
			}),
		),
	);
	store.get(songTableDeviceLayoutAtom);
	store.get(selectedSavedSearchNameAtom);
	await flush();
	return store;
}

describe("searchColumnViewAtom", () => {
	it("resolves width through the fallback chain for the open saved search: its own width, else the shared width, else the default", async () => {
		const store = await createReadyStore(["Rock"]);
		store.set(editingSearchNameAtom, "Rock");
		store.set(songTableDeviceLayoutAtom, {
			widthFlexByTag: { [Song_MetadataTag.ARTIST]: 300 },
			sort: [],
			widthFlexByTagBySearchName: {
				Rock: { [Song_MetadataTag.TITLE]: 555 },
			},
		});
		store.set(searchEditColumnsAtom, {
			columnTags: [
				Song_MetadataTag.TITLE,
				Song_MetadataTag.ARTIST,
				Song_MetadataTag.ALBUM,
			],
			sort: [],
		});

		const result = store.get(searchColumnViewAtom);

		expect(result?.map((column) => column.widthFlex)).toEqual([555, 300, 1]);
	});

	it("falls back to the shared width for every tag when a stored device layout has no per-search map", async () => {
		const store = await createReadyStore(["Rock"]);
		store.set(editingSearchNameAtom, "Rock");
		store.set(songTableDeviceLayoutAtom, {
			widthFlexByTag: { [Song_MetadataTag.TITLE]: 250 },
			sort: [],
		});
		store.set(searchEditColumnsAtom, {
			columnTags: [Song_MetadataTag.TITLE],
			sort: [],
		});

		const result = store.get(searchColumnViewAtom);

		expect(result).toEqual([
			{
				tag: Song_MetadataTag.TITLE,
				widthFlex: 250,
				sortOrder: undefined,
				isSortDesc: false,
			},
		]);
	});

	it("ignores another search's per-search widths when no saved search is open", async () => {
		const store = await createReadyStore([]);
		store.set(songTableDeviceLayoutAtom, {
			widthFlexByTag: { [Song_MetadataTag.TITLE]: 300 },
			sort: [],
			widthFlexByTagBySearchName: {
				Rock: { [Song_MetadataTag.TITLE]: 555 },
			},
		});
		store.set(searchEditColumnsAtom, {
			columnTags: [Song_MetadataTag.TITLE],
			sort: [],
		});

		const result = store.get(searchColumnViewAtom);

		expect(result?.[0].widthFlex).toBe(300);
	});
});
