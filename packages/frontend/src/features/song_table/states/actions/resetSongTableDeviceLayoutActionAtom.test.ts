import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";
import type { DeviceSettingsRepository } from "../../../common";
import {
	buildDeviceSettingKey,
	deviceSettingsRepositoryAtom,
} from "../../../common";
import type { SongTableStateRepository } from "../../repositories/SongTableStateRepository";
import type { SongTableDeviceLayout } from "../../types/songTableTypes";
import { songTableDeviceLayoutAtom } from "../atoms/songTableDeviceLayoutAtom";
import { songTableStateRepositoryAtom } from "../atoms/songTableStateRepositoryAtom";
import { resetSongTableDeviceLayoutActionAtom } from "./resetSongTableDeviceLayoutActionAtom";

const SONG_TABLE_LAYOUT_KEY = buildDeviceSettingKey("songTableLayout");

function createFakeDeviceSettingsRepository(
	initial: Record<string, unknown> = {},
): DeviceSettingsRepository {
	const backing = new Map<string, unknown>(Object.entries(initial));
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

function createFakeSongTableStateRepository(
	fetch: SongTableStateRepository["fetch"],
): SongTableStateRepository {
	return {
		fetch: vi.fn(fetch),
		save: vi.fn(async () => {}),
	};
}

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("resetSongTableDeviceLayoutActionAtom", () => {
	it("writes an empty layout — present, not absent — and clears width and sort", async () => {
		const layout: SongTableDeviceLayout = {
			widthFlexByTag: { [Song_MetadataTag.TITLE]: 250 },
			sort: [{ tag: Song_MetadataTag.TITLE, isDesc: true }],
		};
		const repository = createFakeDeviceSettingsRepository({
			[SONG_TABLE_LAYOUT_KEY]: layout,
		});
		const store = createStore();
		store.set(deviceSettingsRepositoryAtom, repository);
		store.get(songTableDeviceLayoutAtom); // primes the async->sync unwrap
		await flush();

		store.set(resetSongTableDeviceLayoutActionAtom);

		const expected = { widthFlexByTag: {}, sort: [] };
		expect(store.get(songTableDeviceLayoutAtom)).toEqual(expected);
		expect(repository.get(SONG_TABLE_LAYOUT_KEY)).toEqual(expected);
	});

	// Regression test: deleting the key instead of writing an empty layout
	// would re-arm the one-time device migration, which re-imports the
	// workspace document's deprecated widths/sort on next load and silently
	// undoes the reset.
	it("leaves the migration spent: a fresh load sees the empty layout and never re-fetches the workspace document", async () => {
		const layout: SongTableDeviceLayout = {
			widthFlexByTag: { [Song_MetadataTag.TITLE]: 250 },
			sort: [{ tag: Song_MetadataTag.TITLE, isDesc: true }],
		};
		const repository = createFakeDeviceSettingsRepository({
			[SONG_TABLE_LAYOUT_KEY]: layout,
		});
		const firstLoadStore = createStore();
		firstLoadStore.set(deviceSettingsRepositoryAtom, repository);
		firstLoadStore.get(songTableDeviceLayoutAtom);
		await flush();

		firstLoadStore.set(resetSongTableDeviceLayoutActionAtom);

		// Simulates the next app load: a fresh store over the same repository.
		const nextLoadStore = createStore();
		nextLoadStore.set(deviceSettingsRepositoryAtom, repository);
		const songTableStateRepository = createFakeSongTableStateRepository(
			async () => {
				throw new Error(
					"must not fetch the workspace document once the device key is present",
				);
			},
		);
		nextLoadStore.set(songTableStateRepositoryAtom, songTableStateRepository);

		nextLoadStore.get(songTableDeviceLayoutAtom);
		await flush();

		expect(nextLoadStore.get(songTableDeviceLayoutAtom)).toEqual({
			widthFlexByTag: {},
			sort: [],
		});
		expect(songTableStateRepository.fetch).not.toHaveBeenCalled();
	});

	it("does nothing while the migration is still pending", async () => {
		const store = createStore();
		const repository = createFakeDeviceSettingsRepository();
		store.set(deviceSettingsRepositoryAtom, repository);
		store.set(
			songTableStateRepositoryAtom,
			createFakeSongTableStateRepository(() => new Promise(() => {})),
		);
		store.get(songTableDeviceLayoutAtom); // primes; migration never settles

		store.set(resetSongTableDeviceLayoutActionAtom);

		expect(store.get(songTableDeviceLayoutAtom)).toBeUndefined();
		expect(repository.get(SONG_TABLE_LAYOUT_KEY)).toBeUndefined();
	});
});
