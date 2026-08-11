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
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import {
	SongTableColumnSchema,
	SongTableStateSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";
import { renderHook, waitFor } from "@testing-library/react";
import { createStore } from "jotai";
import { Provider } from "jotai/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";

import { ROUTE_HOME_SEARCH } from "../../../const/routes";
import type { AdvancedSearchClient } from "../../advanced_search/services/AdvancedSearchClient";
import { advancedSearchClientAtom } from "../../advanced_search/states/atoms/advancedSearchClientAtom";
import type { DeviceSettingsRepository } from "../../common";
import {
	buildDeviceSettingKey,
	DEVICE_SETTING_KEY_SONG_TABLE_COLUMN_LAYOUT,
	deviceSettingsRepositoryAtom,
} from "../../common";
import { pathnameAtom } from "../../location/states/atoms/locationAtom";
import { mpdClientAtom } from "../../mpd/states/atoms/mpdClientAtom";
import type { PluginService } from "../../plugin/services/PluginService";
import { pluginServiceAtom } from "../../plugin/states/atoms/pluginServiceAtom";
import { pluginStateRepositoryAtom } from "../../plugin/states/atoms/pluginStateRepositoryAtom";
import { mpdProfileStateRepositoryAtom } from "../../profile/states/atoms/mpdProfileStateRepositoryAtom";
import { songTableColumnLayoutKeyForTag } from "../../song_table/functions/songTableColumnLayout";
import {
	songTableStateAsyncAtom,
	songTableStateAtom,
} from "../../song_table/states/atoms/songTableAtom";
import { songTableColumnLayoutAtom } from "../../song_table/states/atoms/songTableColumnLayoutAtom";
import { searchSongTableColumnsAtom } from "../states/atoms/searchEditAtom";
import { searchVisibleSongsAtom } from "../states/atoms/searchSongsAtom";

import { useSearchSongTableProps } from "./useSearchSongTableProps";

const songTableColumnLayoutKey = buildDeviceSettingKey(
	DEVICE_SETTING_KEY_SONG_TABLE_COLUMN_LAYOUT,
);

// Seeds the device layout key so songTableColumnLayoutAtom's one-time
// hydration (see songTableColumnLayoutAtom.ts) short-circuits instead of
// reaching for songTableStateRepositoryAtom, which this test never wires up.
function createFakeDeviceSettingsRepository(): DeviceSettingsRepository {
	const backing = new Map<string, unknown>([[songTableColumnLayoutKey, {}]]);
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

function createColumn(
	tag: Song_MetadataTag,
	opts: { sortOrder?: number; isSortDesc?: boolean; widthFlex?: number } = {},
) {
	return create(SongTableColumnSchema, {
		tag,
		sortOrder: opts.sortOrder,
		isSortDesc: opts.isSortDesc ?? false,
		widthFlex: opts.widthFlex ?? 100,
	});
}

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Stubs every dependency other than the column composition under test. The
 * profile has no target search, so searchSongsAsyncAtom returns `[]` without
 * issuing a real MPD query.
 */
async function createReadyStore() {
	const store = createStore();
	store.set(deviceSettingsRepositoryAtom, createFakeDeviceSettingsRepository());
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
		columns: [
			createColumn(Song_MetadataTag.TITLE, { widthFlex: 1 }),
			createColumn(Song_MetadataTag.ARTIST, { widthFlex: 1 }),
		],
	});
	store.set(songTableStateAsyncAtom, Promise.resolve(serverState));

	// Primes the async->sync unwrap layers the hook reads synchronously
	// (searchVisibleSongsAtom depends on searchSongsAsyncAtom via an internal
	// unwrap; songTableStateAtom depends on songTableStateAsyncAtom via the
	// same mechanism), so the very first render already sees resolved values.
	store.get(searchVisibleSongsAtom);
	store.get(songTableStateAtom);
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
		store.set(songTableColumnLayoutAtom, {
			[songTableColumnLayoutKeyForTag(Song_MetadataTag.TITLE)]: {
				widthFlex: 321,
				isSortDesc: false,
			},
		});

		const { result } = renderSearchSongTableProps(store);
		await waitFor(() => expect(result.current).toBeDefined());

		expect(result.current?.columns.map((c) => c.tag)).toEqual([
			Song_MetadataTag.TITLE,
			Song_MetadataTag.ARTIST,
		]);
		expect(result.current?.columns[0].widthFlex).toBe(321);
		// No device entry for ARTIST: keeps the (common table's) existing width.
		expect(result.current?.columns[1].widthFlex).toBe(1);
	});

	it("uses the saved search's own tag/sort, overlaid with the device width, when searchSongTableColumns is set", async () => {
		const store = await createReadyStore();
		store.set(searchSongTableColumnsAtom, [
			createColumn(Song_MetadataTag.ALBUM, {
				sortOrder: 0,
				isSortDesc: true,
				widthFlex: 0, // saved searches never carry a meaningful width
			}),
		]);
		store.set(songTableColumnLayoutAtom, {
			[songTableColumnLayoutKeyForTag(Song_MetadataTag.ALBUM)]: {
				widthFlex: 555,
				isSortDesc: false,
			},
		});

		const { result } = renderSearchSongTableProps(store);
		await waitFor(() => expect(result.current).toBeDefined());

		expect(result.current?.columns).toHaveLength(1);
		expect(result.current?.columns[0].tag).toBe(Song_MetadataTag.ALBUM);
		expect(result.current?.columns[0].sortOrder).toBe(0);
		expect(result.current?.columns[0].isSortDesc).toBe(true);
		expect(result.current?.columns[0].widthFlex).toBe(555);
	});
});
