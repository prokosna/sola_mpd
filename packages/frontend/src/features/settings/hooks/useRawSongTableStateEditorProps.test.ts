import { create } from "@bufbuild/protobuf";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import {
	SongTableColumnSchema,
	SongTableStateSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";
import { act, renderHook } from "@testing-library/react";
import { getDefaultStore } from "jotai";
import { describe, expect, it, vi } from "vitest";

import type { DeviceSettingsRepository } from "../../common";
import { deviceSettingsRepositoryAtom } from "../../common";
import type { SongTableStateRepository } from "../../song_table/repositories/SongTableStateRepository";
import {
	songTableServerStateAtom,
	songTableStateAsyncAtom,
} from "../../song_table/states/atoms/songTableAtom";
import { songTableColumnViewAtom } from "../../song_table/states/atoms/songTableColumnViewAtom";
import { songTableDeviceLayoutAtom } from "../../song_table/states/atoms/songTableDeviceLayoutAtom";
import { songTableStateRepositoryAtom } from "../../song_table/states/atoms/songTableStateRepositoryAtom";

import { useRawSongTableStateEditorProps } from "./useRawSongTableStateEditorProps";

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

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("useRawSongTableStateEditorProps", () => {
	it(
		"feeds the editor from the genuine server document, not the device-" +
			"composed songTableColumnViewAtom (regression: Raw Data must be a " +
			"true escape hatch onto what's actually on disk)",
		async () => {
			const store = getDefaultStore();
			store.set(
				deviceSettingsRepositoryAtom,
				createFakeDeviceSettingsRepository(),
			);
			const songTableStateRepository = createFakeSongTableStateRepository();
			store.set(songTableStateRepositoryAtom, songTableStateRepository);

			// The server's stale/frozen deprecated `columns`, which are what's
			// genuinely on disk and must be exactly what the raw editor shows.
			const serverState = create(SongTableStateSchema, {
				columnTags: [Song_MetadataTag.TITLE],
				columns: [
					create(SongTableColumnSchema, {
						tag: Song_MetadataTag.TITLE,
						sortOrder: 99,
						isSortDesc: false,
						widthFlex: 1,
					}),
				],
			});
			store.set(songTableStateAsyncAtom, Promise.resolve(serverState));
			store.get(songTableServerStateAtom); // primes the async->sync unwrap
			store.get(songTableDeviceLayoutAtom); // primes the device layout hydration
			await flush();

			// The device layout overrides TITLE's width — this is what
			// songTableColumnViewAtom (the composed view) would show, and must
			// NOT be what the raw editor shows.
			store.set(songTableDeviceLayoutAtom, {
				widthFlexByTag: { [Song_MetadataTag.TITLE]: 250 },
				sort: [{ tag: Song_MetadataTag.TITLE, isDesc: true }],
			});
			expect(store.get(songTableColumnViewAtom)?.[0].widthFlex).toBe(250);

			const { result } = renderHook(() => useRawSongTableStateEditorProps());
			const [, editorProps] = result.current;

			expect(editorProps?.state.columns[0]).toMatchObject({
				sortOrder: 99,
				isSortDesc: false,
				widthFlex: 1,
			});

			// Saving must reach the server with exactly what was given, bypassing
			// the tag-diff gate that the device-aware update path uses.
			const edited = create(SongTableStateSchema, {
				columns: [
					create(SongTableColumnSchema, {
						tag: Song_MetadataTag.TITLE,
						sortOrder: 7,
						isSortDesc: true,
						widthFlex: 42,
					}),
				],
			});
			await act(async () => {
				await editorProps?.onSave(edited);
			});

			expect(songTableStateRepository.save).toHaveBeenCalledWith(edited);
		},
	);
});
