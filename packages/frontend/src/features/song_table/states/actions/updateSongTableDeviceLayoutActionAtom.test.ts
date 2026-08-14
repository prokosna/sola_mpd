import { create } from "@bufbuild/protobuf";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { SongTableStateSchema } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";

import type { DeviceSettingsRepository } from "../../../common";
import { deviceSettingsRepositoryAtom } from "../../../common";
import type { SongTableStateRepository } from "../../repositories/SongTableStateRepository";
import { songTableDeviceLayoutAtom } from "../atoms/songTableDeviceLayoutAtom";
import { songTableStateRepositoryAtom } from "../atoms/songTableStateRepositoryAtom";
import { updateSongTableDeviceLayoutActionAtom } from "./updateSongTableDeviceLayoutActionAtom";

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

function createFakeSongTableStateRepository(): SongTableStateRepository {
	return {
		fetch: vi.fn(async () => create(SongTableStateSchema, {})),
		save: vi.fn(async () => {}),
	};
}

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

async function createReadyStore() {
	const store = createStore();
	store.set(deviceSettingsRepositoryAtom, createFakeDeviceSettingsRepository());
	store.set(songTableStateRepositoryAtom, createFakeSongTableStateRepository());
	store.get(songTableDeviceLayoutAtom); // primes the async->sync unwrap
	await flush();
	return store;
}

describe("updateSongTableDeviceLayoutActionAtom", () => {
	it("merges a width patch over the current widths without dropping other tags", async () => {
		const store = await createReadyStore();
		store.set(songTableDeviceLayoutAtom, {
			widthFlexByTag: { [Song_MetadataTag.ARTIST]: 100 },
			sort: [],
		});

		store.set(updateSongTableDeviceLayoutActionAtom, {
			widthFlexByTag: { [Song_MetadataTag.TITLE]: 250 },
		});

		expect(store.get(songTableDeviceLayoutAtom)?.widthFlexByTag).toEqual({
			[Song_MetadataTag.ARTIST]: 100,
			[Song_MetadataTag.TITLE]: 250,
		});
	});

	it("replaces the sort list wholesale, without touching widths", async () => {
		const store = await createReadyStore();
		store.set(songTableDeviceLayoutAtom, {
			widthFlexByTag: { [Song_MetadataTag.TITLE]: 250 },
			sort: [{ tag: Song_MetadataTag.ARTIST, isDesc: false }],
		});

		store.set(updateSongTableDeviceLayoutActionAtom, {
			sort: [{ tag: Song_MetadataTag.TITLE, isDesc: true }],
		});

		const layout = store.get(songTableDeviceLayoutAtom);
		expect(layout?.sort).toEqual([
			{ tag: Song_MetadataTag.TITLE, isDesc: true },
		]);
		expect(layout?.widthFlexByTag).toEqual({ [Song_MetadataTag.TITLE]: 250 });
	});

	it("is a no-op while the migration is still pending", () => {
		const store = createStore();
		store.set(
			deviceSettingsRepositoryAtom,
			createFakeDeviceSettingsRepository(),
		);
		store.set(songTableStateRepositoryAtom, {
			fetch: () => new Promise(() => {}),
			save: vi.fn(async () => {}),
		});
		store.get(songTableDeviceLayoutAtom); // migration never settles

		store.set(updateSongTableDeviceLayoutActionAtom, {
			widthFlexByTag: { [Song_MetadataTag.TITLE]: 250 },
		});

		expect(store.get(songTableDeviceLayoutAtom)).toBeUndefined();
	});
});
