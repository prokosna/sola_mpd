import { create } from "@bufbuild/protobuf";
import {
	MpdCommand_Status_StatsResponseSchema,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import {
	MpdProfileSchema,
	MpdProfileStateSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { MpdStatsSchema } from "@sola_mpd/shared/src/models/mpd/mpd_stats_pb.js";
import { PluginStateSchema } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import {
	SavedSearchesSchema,
	SearchSchema,
} from "@sola_mpd/shared/src/models/search_pb.js";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { SongTableStateSchema } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { renderHook, waitFor } from "@testing-library/react";
import { createStore } from "jotai";
import { Provider } from "jotai/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";

import { ROUTE_HOME_SEARCH } from "../../../const/routes";
import type { AdvancedSearchClient } from "../../advanced_search/services/AdvancedSearchClient";
import { advancedSearchClientAtom } from "../../advanced_search/states/atoms/advancedSearchClientAtom";
import type { DeviceSettingsRepository } from "../../common";
import { deviceSettingsRepositoryAtom } from "../../common";
import { pathnameAtom } from "../../location/states/atoms/locationAtom";
import { mpdClientAtom } from "../../mpd/states/atoms/mpdClientAtom";
import type { PluginService } from "../../plugin/services/PluginService";
import { pluginServiceAtom } from "../../plugin/states/atoms/pluginServiceAtom";
import { pluginStateRepositoryAtom } from "../../plugin/states/atoms/pluginStateRepositoryAtom";
import { mpdProfileStateRepositoryAtom } from "../../profile/states/atoms/mpdProfileStateRepositoryAtom";
import {
	songTableServerStateAtom,
	songTableStateAsyncAtom,
} from "../../song_table/states/atoms/songTableAtom";
import { songTableDeviceLayoutAtom } from "../../song_table/states/atoms/songTableDeviceLayoutAtom";
import { songTableStateRepositoryAtom } from "../../song_table/states/atoms/songTableStateRepositoryAtom";
import { savedSearchesAsyncAtom } from "../states/atoms/savedSearchesAtom";
import {
	editingSearchNameAtom,
	searchEditColumnsAtom,
	selectedSavedSearchNameAtom,
} from "../states/atoms/searchEditAtom";
import { searchVisibleSongsAtom } from "../states/atoms/searchSongsAtom";

import { useSearchSongTableProps } from "./useSearchSongTableProps";

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

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Stubs every dependency other than the column composition under test. The
 * profile has no target search, so searchSongsAsyncAtom returns `[]` without
 * issuing a real MPD query.
 */
async function createReadyStore(savedSearchNames: string[] = []) {
	const store = createStore();
	store.set(deviceSettingsRepositoryAtom, createFakeDeviceSettingsRepository());
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
	store.set(songTableStateRepositoryAtom, {
		fetch: vi.fn(async () => create(SongTableStateSchema, {})),
		save: vi.fn(async () => {}),
	});
	store.set(pathnameAtom, ROUTE_HOME_SEARCH);

	const profile = create(MpdProfileSchema, {
		name: "Home",
		host: "localhost",
		port: 6600,
	});
	store.set(mpdProfileStateRepositoryAtom, {
		fetch: vi.fn(async () =>
			create(MpdProfileStateSchema, {
				currentProfile: profile,
				profiles: [profile],
			}),
		),
		save: vi.fn(async () => {}),
	});
	store.set(mpdClientAtom, {
		command: vi.fn(async () =>
			create(MpdResponseSchema, {
				command: {
					case: "stats",
					value: create(MpdCommand_Status_StatsResponseSchema, {
						stats: create(MpdStatsSchema, {}),
					}),
				},
			}),
		),
		commandBulk: vi.fn(async () => {}),
	});

	store.set(pluginStateRepositoryAtom, {
		fetch: vi.fn(async () => create(PluginStateSchema, { plugins: [] })),
		save: vi.fn(async () => {}),
	});
	store.set(pluginServiceAtom, {
		register: vi.fn(),
		execute: vi.fn(),
	} as unknown as PluginService);
	store.set(advancedSearchClientAtom, {
		command: vi.fn(),
	} as AdvancedSearchClient);

	const serverState = create(SongTableStateSchema, {
		columnTags: [Song_MetadataTag.TITLE, Song_MetadataTag.ARTIST],
	});
	store.set(songTableStateAsyncAtom, Promise.resolve(serverState));

	// Primes the async->sync unwrap layers the hook reads synchronously
	// (searchVisibleSongsAtom depends on searchSongsAsyncAtom via an internal
	// unwrap; songTableServerStateAtom and songTableDeviceLayoutAtom the
	// same), so the very first render already sees resolved values.
	store.get(searchVisibleSongsAtom);
	store.get(songTableServerStateAtom);
	store.get(songTableDeviceLayoutAtom);
	store.get(selectedSavedSearchNameAtom);
	await flush();
	// searchVisibleSongsAtom's dependency chain resolves over two hops
	// (profile fetch, then the search-songs fetch keyed off it); a second
	// prime + flush lets both settle before the hook renders.
	store.get(searchVisibleSongsAtom);
	await flush();

	return store;
}

function renderSearchSongTableProps(store: ReturnType<typeof createStore>) {
	return renderHook(
		() =>
			useSearchSongTableProps(
				{ current: [] },
				() => {},
				() => {},
			),
		{
			wrapper: ({ children }) => createElement(Provider, { store }, children),
		},
	);
}

describe("useSearchSongTableProps", () => {
	it("falls back to the common table's tag/sort, overlaid with the device width, when no saved-search columns are set", async () => {
		const store = await createReadyStore();
		store.set(songTableDeviceLayoutAtom, {
			widthFlexByTag: { [Song_MetadataTag.TITLE]: 321 },
			sort: [],
		});

		const { result } = renderSearchSongTableProps(store);
		await waitFor(() => expect(result.current).toBeDefined());

		expect(result.current?.columns.map((c) => c.tag)).toEqual([
			Song_MetadataTag.TITLE,
			Song_MetadataTag.ARTIST,
		]);
		expect(result.current?.columns[0].widthFlex).toBe(321);
		// No device entry for ARTIST: falls back to the default flex.
		expect(result.current?.columns[1].widthFlex).toBe(1);
	});

	it("uses the saved search's own tag/sort, overlaid with the device width, when a search edit is set", async () => {
		const store = await createReadyStore();
		store.set(searchEditColumnsAtom, {
			columnTags: [Song_MetadataTag.ALBUM],
			sort: [{ tag: Song_MetadataTag.ALBUM, isDesc: true }],
		});
		store.set(songTableDeviceLayoutAtom, {
			widthFlexByTag: { [Song_MetadataTag.ALBUM]: 555 },
			sort: [],
		});

		const { result } = renderSearchSongTableProps(store);
		await waitFor(() => expect(result.current).toBeDefined());

		expect(result.current?.columns).toHaveLength(1);
		expect(result.current?.columns[0].tag).toBe(Song_MetadataTag.ALBUM);
		expect(result.current?.columns[0].sortOrder).toBe(0);
		expect(result.current?.columns[0].isSortDesc).toBe(true);
		expect(result.current?.columns[0].widthFlex).toBe(555);
	});

	it("drops the open saved search's own width and staged sort on Reset Layout, leaving the shared device layout untouched", async () => {
		const store = await createReadyStore(["Rock"]);
		store.set(editingSearchNameAtom, "Rock");
		store.set(searchEditColumnsAtom, {
			columnTags: [Song_MetadataTag.ALBUM],
			sort: [{ tag: Song_MetadataTag.ALBUM, isDesc: true }],
		});
		const sharedLayout = {
			widthFlexByTag: { [Song_MetadataTag.ALBUM]: 100 },
			sort: [{ tag: Song_MetadataTag.ARTIST, isDesc: false }],
			widthFlexByTagBySearchName: {
				Rock: { [Song_MetadataTag.ALBUM]: 555 },
			},
		};
		store.set(songTableDeviceLayoutAtom, sharedLayout);

		const { result } = renderSearchSongTableProps(store);
		await waitFor(() => expect(result.current).toBeDefined());

		const resetLayoutItem = result.current?.contextMenuSections
			.flatMap((section) => section.items)
			.find((item) => item.name === "Reset Layout");
		await resetLayoutItem?.onClick?.(undefined);

		expect(store.get(songTableDeviceLayoutAtom)).toEqual({
			...sharedLayout,
			widthFlexByTagBySearchName: {},
		});
		expect(store.get(searchEditColumnsAtom)).toEqual({
			columnTags: [Song_MetadataTag.ALBUM],
			sort: [],
		});
	});
});
