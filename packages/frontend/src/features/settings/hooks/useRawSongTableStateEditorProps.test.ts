import { create } from "@bufbuild/protobuf";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import {
	SongTableColumnSchema,
	SongTableStateSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";
import { act, renderHook } from "@testing-library/react";
import { getDefaultStore } from "jotai";
import { describe, expect, it, vi } from "vitest";

import type { DeviceSettingsRepository } from "../../common/repositories/DeviceSettingsRepository";
import { deviceSettingsRepositoryAtom } from "../../common/states/atoms/deviceSettingsRepositoryAtom";
import { songTableColumnLayoutKeyForTag } from "../../song_table/functions/songTableColumnLayout";
import type { SongTableStateRepository } from "../../song_table/repositories/SongTableStateRepository";
import {
	songTableServerStateAtom,
	songTableStateAsyncAtom,
} from "../../song_table/states/atoms/songTableAtom";
import { songTableColumnLayoutAtom } from "../../song_table/states/atoms/songTableColumnLayoutAtom";
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
			"composed songTableStateAtom (regression: Raw Data must be a true " +
			"escape hatch onto what's actually on disk)",
		async () => {
			const store = getDefaultStore();
			store.set(
				deviceSettingsRepositoryAtom,
				createFakeDeviceSettingsRepository(),
			);
			const songTableStateRepository = createFakeSongTableStateRepository();
			store.set(songTableStateRepositoryAtom, songTableStateRepository);

			// The device layout overrides TITLE's width/sort — this is what
			// songTableStateAtom (the composed view) would show, and must NOT be
			// what the raw editor shows.
			store.set(songTableColumnLayoutAtom, {
				[songTableColumnLayoutKeyForTag(Song_MetadataTag.TITLE)]: {
					widthFlex: 250,
					sortOrder: 0,
					isSortDesc: true,
				},
			});

			// The server's stale/frozen values, which are what's genuinely on
			// disk and must be exactly what the raw editor shows.
			const serverState = create(SongTableStateSchema, {
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
			await flush();

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
