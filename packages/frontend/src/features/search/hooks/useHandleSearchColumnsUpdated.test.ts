import { create } from "@bufbuild/protobuf";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import {
	SongTableColumnSchema,
	SongTableStateSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";
import { act, renderHook } from "@testing-library/react";
import { createStore } from "jotai";
import { Provider } from "jotai/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import type { DeviceSettingsRepository } from "../../common";
import {
	buildDeviceSettingKey,
	DEVICE_SETTING_KEY_SONG_TABLE_COLUMN_LAYOUT,
	deviceSettingsRepositoryAtom,
} from "../../common";
import { songTableColumnLayoutKeyForTag } from "../../song_table/functions/songTableColumnLayout";
import { songTableStateAsyncAtom } from "../../song_table/states/atoms/songTableAtom";
import { songTableColumnLayoutAtom } from "../../song_table/states/atoms/songTableColumnLayoutAtom";
import {
	editingSearchStatusAtom,
	searchSongTableColumnsAtom,
} from "../states/atoms/searchEditAtom";
import { EditingSearchStatus } from "../types/searchTypes";

import { useHandleSearchColumnsUpdated } from "./useHandleSearchColumnsUpdated";

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

async function createReadyStore() {
	const store = createStore();
	store.set(deviceSettingsRepositoryAtom, createFakeDeviceSettingsRepository());
	const commonState = create(SongTableStateSchema, {
		columns: [
			createColumn(Song_MetadataTag.TITLE, { sortOrder: 0 }),
			createColumn(Song_MetadataTag.ARTIST),
		],
	});
	store.set(songTableStateAsyncAtom, Promise.resolve(commonState));
	store.get(songTableColumnLayoutAtom);
	await flush();
	return store;
}

function renderUseHandleSearchColumnsUpdated(
	store: ReturnType<typeof createStore>,
) {
	return renderHook(() => useHandleSearchColumnsUpdated(), {
		wrapper: ({ children }) => createElement(Provider, { store }, children),
	});
}

describe("useHandleSearchColumnsUpdated", () => {
	it("writes tag changes to the saved search and marks it as edited", async () => {
		const store = await createReadyStore();
		const { result } = renderUseHandleSearchColumnsUpdated(store);

		act(() => {
			result.current([
				createColumn(Song_MetadataTag.ARTIST, { sortOrder: 0 }),
				createColumn(Song_MetadataTag.TITLE),
			]);
		});

		expect(store.get(editingSearchStatusAtom)).toBe(
			EditingSearchStatus.COLUMNS_UPDATED,
		);
		expect(store.get(searchSongTableColumnsAtom).map((c) => c.tag)).toEqual([
			Song_MetadataTag.ARTIST,
			Song_MetadataTag.TITLE,
		]);
	});

	it("writes sort changes to the saved search and marks it as edited, without touching the device layout", async () => {
		const store = await createReadyStore();
		store.set(searchSongTableColumnsAtom, [
			createColumn(Song_MetadataTag.TITLE, { sortOrder: 0, isSortDesc: false }),
			createColumn(Song_MetadataTag.ARTIST),
		]);
		const { result } = renderUseHandleSearchColumnsUpdated(store);

		act(() => {
			result.current([
				createColumn(Song_MetadataTag.TITLE, {
					sortOrder: 0,
					isSortDesc: true,
				}),
				createColumn(Song_MetadataTag.ARTIST),
			]);
		});

		expect(store.get(editingSearchStatusAtom)).toBe(
			EditingSearchStatus.COLUMNS_UPDATED,
		);
		expect(store.get(searchSongTableColumnsAtom)[0].isSortDesc).toBe(true);
		expect(store.get(songTableColumnLayoutAtom)).toEqual({});
	});

	// Regression test: width and sort must not be treated alike.
	// A width-only drag must not mark the saved search as edited, and must not
	// write into Search.columns — only the device layout changes.
	it("routes a width-only change to the device layout and leaves the editing status untouched", async () => {
		const store = await createReadyStore();
		store.set(searchSongTableColumnsAtom, [
			createColumn(Song_MetadataTag.TITLE, { sortOrder: 0, widthFlex: 100 }),
			createColumn(Song_MetadataTag.ARTIST, { widthFlex: 100 }),
		]);
		const statusBeforeEdit = store.get(editingSearchStatusAtom);
		const { result } = renderUseHandleSearchColumnsUpdated(store);

		act(() => {
			result.current([
				createColumn(Song_MetadataTag.TITLE, { sortOrder: 0, widthFlex: 250 }),
				createColumn(Song_MetadataTag.ARTIST, { widthFlex: 100 }),
			]);
		});

		expect(store.get(editingSearchStatusAtom)).toBe(statusBeforeEdit);
		expect(store.get(searchSongTableColumnsAtom)[0].widthFlex).toBe(100);
		expect(
			store.get(songTableColumnLayoutAtom)[
				songTableColumnLayoutKeyForTag(Song_MetadataTag.TITLE)
			].widthFlex,
		).toBe(250);
	});
});
