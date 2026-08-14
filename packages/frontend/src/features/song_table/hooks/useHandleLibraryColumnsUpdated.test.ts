import { create } from "@bufbuild/protobuf";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { SongTableStateSchema } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { act, renderHook } from "@testing-library/react";
import { createStore } from "jotai";
import { Provider } from "jotai/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";

import type { DeviceSettingsRepository } from "../../common";
import { deviceSettingsRepositoryAtom } from "../../common";
import type { SongTableStateRepository } from "../repositories/SongTableStateRepository";
import {
	songTableServerStateAtom,
	songTableStateAsyncAtom,
} from "../states/atoms/songTableAtom";
import { songTableDeviceLayoutAtom } from "../states/atoms/songTableDeviceLayoutAtom";
import { songTableStateRepositoryAtom } from "../states/atoms/songTableStateRepositoryAtom";
import type { SongTableColumnView } from "../types/songTableTypes";
import { useHandleLibraryColumnsUpdated } from "./useHandleLibraryColumnsUpdated";

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
		fetch: vi.fn(async () => create(SongTableStateSchema, {})),
		save: vi.fn(async () => {}),
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
	const songTableStateRepository = createFakeSongTableStateRepository();
	store.set(songTableStateRepositoryAtom, songTableStateRepository);
	const serverState = create(SongTableStateSchema, {
		columnTags: [Song_MetadataTag.TITLE, Song_MetadataTag.ARTIST],
	});
	store.set(songTableStateAsyncAtom, Promise.resolve(serverState));
	store.get(songTableServerStateAtom);
	store.get(songTableDeviceLayoutAtom);
	await flush();
	return { store, songTableStateRepository };
}

function renderUseHandleLibraryColumnsUpdated(
	store: ReturnType<typeof createStore>,
) {
	return renderHook(() => useHandleLibraryColumnsUpdated(), {
		wrapper: ({ children }) => createElement(Provider, { store }, children),
	});
}

describe("useHandleLibraryColumnsUpdated", () => {
	it("writes a tag reorder to the workspace column set", async () => {
		const { store, songTableStateRepository } = await createReadyStore();
		const { result } = renderUseHandleLibraryColumnsUpdated(store);

		await act(async () => {
			await result.current([
				createColumn(Song_MetadataTag.ARTIST),
				createColumn(Song_MetadataTag.TITLE),
			]);
		});

		expect(songTableStateRepository.save).toHaveBeenCalledTimes(1);
		expect(store.get(songTableServerStateAtom)?.columnTags).toEqual([
			Song_MetadataTag.ARTIST,
			Song_MetadataTag.TITLE,
		]);
	});

	it("writes a sort-only change to the device layout, without touching the server", async () => {
		const { store, songTableStateRepository } = await createReadyStore();
		const { result } = renderUseHandleLibraryColumnsUpdated(store);

		await act(async () => {
			await result.current([
				createColumn(Song_MetadataTag.TITLE, {
					sortOrder: 0,
					isSortDesc: true,
				}),
				createColumn(Song_MetadataTag.ARTIST),
			]);
		});

		expect(songTableStateRepository.save).not.toHaveBeenCalled();
		expect(store.get(songTableDeviceLayoutAtom)?.sort).toEqual([
			{ tag: Song_MetadataTag.TITLE, isDesc: true },
		]);
	});

	it("writes a width-only change to the device layout, without touching the server", async () => {
		const { store, songTableStateRepository } = await createReadyStore();
		const { result } = renderUseHandleLibraryColumnsUpdated(store);

		await act(async () => {
			await result.current([
				createColumn(Song_MetadataTag.TITLE, { widthFlex: 250 }),
				createColumn(Song_MetadataTag.ARTIST),
			]);
		});

		expect(songTableStateRepository.save).not.toHaveBeenCalled();
		expect(store.get(songTableDeviceLayoutAtom)?.widthFlexByTag).toEqual({
			[Song_MetadataTag.TITLE]: 250,
			[Song_MetadataTag.ARTIST]: 1,
		});
	});
});
