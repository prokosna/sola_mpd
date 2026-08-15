import { create } from "@bufbuild/protobuf";
import {
	SavedSearchesSchema,
	SearchSchema,
} from "@sola_mpd/shared/src/models/search_pb.js";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { createStore } from "jotai";
import { beforeEach, describe, expect, it } from "vitest";

import type { DeviceSettingsRepository } from "../../../common";
import { deviceSettingsRepositoryAtom } from "../../../common";
import type { SongTableStateRepository } from "../../../song_table/repositories/SongTableStateRepository";
import { songTableDeviceLayoutAtom } from "../../../song_table/states/atoms/songTableDeviceLayoutAtom";
import { songTableStateRepositoryAtom } from "../../../song_table/states/atoms/songTableStateRepositoryAtom";
import type { SongTableDeviceLayout } from "../../../song_table/types/songTableTypes";
import { savedSearchesAsyncAtom } from "../atoms/savedSearchesAtom";
import {
	editingSearchNameAtom,
	searchEditColumnsAtom,
	selectedSavedSearchNameAtom,
} from "../atoms/searchEditAtom";
import { resetSearchLayoutActionAtom } from "./resetSearchLayoutActionAtom";

const SEARCH_PANEL_KEY = "react-resizable-panels:search";
const SEARCH_NAVIGATION_PANEL_KEY = "react-resizable-panels:search-navigation";
const OTHER_VIEW_PANEL_KEY = "react-resizable-panels:browser-view";

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
		fetch: async () => {
			throw new Error("not needed for these tests");
		},
		save: async () => {},
	};
}

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

async function createReadyStore(savedSearchNames: string[] = []) {
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

describe("resetSearchLayoutActionAtom", () => {
	beforeEach(() => {
		globalThis.localStorage.clear();
	});

	it("with a saved search open: drops that search's widths and staged sort, clears only Search's pane keys, and leaves the shared map and other views' panes intact", async () => {
		const store = await createReadyStore(["Rock"]);
		store.set(editingSearchNameAtom, "Rock");
		const sharedLayout: SongTableDeviceLayout = {
			widthFlexByTag: { [Song_MetadataTag.ARTIST]: 100 },
			sort: [{ tag: Song_MetadataTag.ARTIST, isDesc: false }],
			widthFlexByTagBySearchName: {
				Rock: { [Song_MetadataTag.TITLE]: 250 },
			},
		};
		store.set(songTableDeviceLayoutAtom, sharedLayout);
		store.set(searchEditColumnsAtom, {
			columnTags: [Song_MetadataTag.TITLE],
			sort: [{ tag: Song_MetadataTag.TITLE, isDesc: true }],
		});
		globalThis.localStorage.setItem(SEARCH_PANEL_KEY, "[1,2]");
		globalThis.localStorage.setItem(SEARCH_NAVIGATION_PANEL_KEY, "[3,4]");
		globalThis.localStorage.setItem(OTHER_VIEW_PANEL_KEY, "[5,6]");

		store.set(resetSearchLayoutActionAtom);

		const layout = store.get(songTableDeviceLayoutAtom);
		expect(layout?.widthFlexByTagBySearchName).toEqual({});
		expect(layout?.widthFlexByTag).toEqual({ [Song_MetadataTag.ARTIST]: 100 });
		expect(layout?.sort).toEqual([
			{ tag: Song_MetadataTag.ARTIST, isDesc: false },
		]);
		expect(store.get(searchEditColumnsAtom)?.sort).toEqual([]);
		expect(globalThis.localStorage.getItem(SEARCH_PANEL_KEY)).toBeNull();
		expect(
			globalThis.localStorage.getItem(SEARCH_NAVIGATION_PANEL_KEY),
		).toBeNull();
		expect(globalThis.localStorage.getItem(OTHER_VIEW_PANEL_KEY)).toBe("[5,6]");
	});

	it("with no saved search open: behaves like a library reset — clears the shared map, the shared sort, and every pane key", async () => {
		const store = await createReadyStore();
		store.set(songTableDeviceLayoutAtom, {
			widthFlexByTag: { [Song_MetadataTag.ARTIST]: 100 },
			sort: [{ tag: Song_MetadataTag.ARTIST, isDesc: false }],
		});
		globalThis.localStorage.setItem(SEARCH_PANEL_KEY, "[1,2]");
		globalThis.localStorage.setItem(SEARCH_NAVIGATION_PANEL_KEY, "[3,4]");
		globalThis.localStorage.setItem(OTHER_VIEW_PANEL_KEY, "[5,6]");

		store.set(resetSearchLayoutActionAtom);

		expect(store.get(songTableDeviceLayoutAtom)).toEqual({
			widthFlexByTag: {},
			sort: [],
		});
		expect(globalThis.localStorage.getItem(SEARCH_PANEL_KEY)).toBeNull();
		expect(
			globalThis.localStorage.getItem(SEARCH_NAVIGATION_PANEL_KEY),
		).toBeNull();
		expect(globalThis.localStorage.getItem(OTHER_VIEW_PANEL_KEY)).toBeNull();
	});

	it("is a no-op while the device layout migration is still pending", async () => {
		const store = createStore();
		store.set(
			deviceSettingsRepositoryAtom,
			createFakeDeviceSettingsRepository(),
		);
		store.set(songTableStateRepositoryAtom, {
			fetch: () => new Promise(() => {}),
			save: async () => {},
		});
		globalThis.localStorage.setItem(SEARCH_PANEL_KEY, "[1,2]");
		store.get(songTableDeviceLayoutAtom); // migration never settles

		store.set(resetSearchLayoutActionAtom);

		expect(store.get(songTableDeviceLayoutAtom)).toBeUndefined();
		expect(globalThis.localStorage.getItem(SEARCH_PANEL_KEY)).not.toBeNull();
	});
});
