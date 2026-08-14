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
import { describe, expect, it, vi } from "vitest";
import type { DeviceSettingsRepository } from "../../common";
import { deviceSettingsRepositoryAtom } from "../../common";
import {
	songTableServerStateAtom,
	songTableStateAsyncAtom,
} from "../../song_table/states/atoms/songTableAtom";
import { songTableColumnViewAtom } from "../../song_table/states/atoms/songTableColumnViewAtom";
import { songTableDeviceLayoutAtom } from "../../song_table/states/atoms/songTableDeviceLayoutAtom";
import { songTableStateRepositoryAtom } from "../../song_table/states/atoms/songTableStateRepositoryAtom";
import type { SongTableColumnView } from "../../song_table/types/songTableTypes";
import {
	editingSearchStatusAtom,
	searchSongTableColumnsAtom,
} from "../states/atoms/searchEditAtom";
import { EditingSearchStatus } from "../types/searchTypes";

import { useHandleSearchColumnsUpdated } from "./useHandleSearchColumnsUpdated";

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

function createColumn(
	tag: Song_MetadataTag,
	opts: { sortOrder?: number; isSortDesc?: boolean; widthFlex?: number } = {},
): SongTableColumnView {
	return {
		tag,
		sortOrder: opts.sortOrder,
		isSortDesc: opts.isSortDesc ?? false,
		widthFlex: opts.widthFlex ?? 1,
	};
}

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

async function createReadyStore() {
	const store = createStore();
	store.set(deviceSettingsRepositoryAtom, createFakeDeviceSettingsRepository());
	store.set(songTableStateRepositoryAtom, {
		fetch: vi.fn(async () => create(SongTableStateSchema, {})),
		save: vi.fn(async () => {}),
	});
	const commonState = create(SongTableStateSchema, {
		columnTags: [Song_MetadataTag.TITLE, Song_MetadataTag.ARTIST],
	});
	store.set(songTableStateAsyncAtom, Promise.resolve(commonState));
	store.get(songTableServerStateAtom);
	store.get(songTableDeviceLayoutAtom);
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
		const searchColumns = [
			create(SongTableColumnSchema, {
				tag: Song_MetadataTag.TITLE,
				sortOrder: 0,
				isSortDesc: false,
			}),
			create(SongTableColumnSchema, { tag: Song_MetadataTag.ARTIST }),
		];
		store.set(searchSongTableColumnsAtom, searchColumns);
		const layoutBefore = store.get(songTableDeviceLayoutAtom);
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
		expect(store.get(songTableDeviceLayoutAtom)).toEqual(layoutBefore);
	});

	// Regression test: width and sort must not be treated alike.
	// A width-only drag must not mark the saved search as edited, and must not
	// write into Search.columns — only the device layout changes.
	it("routes a width-only change to the device layout and leaves the editing status untouched", async () => {
		const store = await createReadyStore();
		const searchColumns = [
			create(SongTableColumnSchema, {
				tag: Song_MetadataTag.TITLE,
				sortOrder: 0,
			}),
			create(SongTableColumnSchema, { tag: Song_MetadataTag.ARTIST }),
		];
		store.set(searchSongTableColumnsAtom, searchColumns);
		const statusBeforeEdit = store.get(editingSearchStatusAtom);
		const { result } = renderUseHandleSearchColumnsUpdated(store);

		act(() => {
			result.current([
				createColumn(Song_MetadataTag.TITLE, { sortOrder: 0, widthFlex: 250 }),
				createColumn(Song_MetadataTag.ARTIST, { widthFlex: 1 }),
			]);
		});

		expect(store.get(editingSearchStatusAtom)).toBe(statusBeforeEdit);
		expect(store.get(searchSongTableColumnsAtom)).toEqual(searchColumns);
		expect(store.get(songTableDeviceLayoutAtom)?.widthFlexByTag).toEqual({
			[Song_MetadataTag.TITLE]: 250,
			[Song_MetadataTag.ARTIST]: 1,
		});
	});

	// Regression: the device layout is where the common song table reads its
	// sort from, so a width drag in Search must not touch it.
	it("does not write the saved search's sort into the device layout on a width change", async () => {
		const store = await createReadyStore();
		store.set(songTableDeviceLayoutAtom, {
			widthFlexByTag: { [Song_MetadataTag.TITLE]: 1 },
			sort: [],
		});
		store.set(searchSongTableColumnsAtom, [
			create(SongTableColumnSchema, {
				tag: Song_MetadataTag.TITLE,
				sortOrder: 0,
				isSortDesc: true,
			}),
		]);
		const { result } = renderUseHandleSearchColumnsUpdated(store);

		act(() => {
			result.current([
				createColumn(Song_MetadataTag.TITLE, {
					sortOrder: 0,
					isSortDesc: true,
					widthFlex: 250,
				}),
			]);
		});

		const layout = store.get(songTableDeviceLayoutAtom);
		expect(layout?.widthFlexByTag[Song_MetadataTag.TITLE]).toBe(250);
		expect(layout?.sort).toEqual([]);
	});

	it("does nothing while the device layout migration is still pending", async () => {
		const store = createStore();
		store.set(
			deviceSettingsRepositoryAtom,
			createFakeDeviceSettingsRepository(),
		);
		store.set(songTableStateRepositoryAtom, {
			fetch: () => new Promise(() => {}),
			save: vi.fn(async () => {}),
		});
		store.set(
			songTableStateAsyncAtom,
			Promise.resolve(create(SongTableStateSchema, {})),
		);
		store.get(songTableServerStateAtom);
		store.get(songTableDeviceLayoutAtom); // never settles
		const { result } = renderUseHandleSearchColumnsUpdated(store);

		act(() => {
			result.current([
				createColumn(Song_MetadataTag.TITLE, { widthFlex: 250 }),
			]);
		});

		expect(store.get(editingSearchStatusAtom)).toBe(
			EditingSearchStatus.NOT_SAVED,
		);
		expect(store.get(songTableColumnViewAtom)).toBeUndefined();
	});
});
