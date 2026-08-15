import { create } from "@bufbuild/protobuf";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { SongTableStateSchema } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { createStore } from "jotai";
import { describe, expect, it } from "vitest";

import type { DeviceSettingsRepository } from "../../../common";
import { deviceSettingsRepositoryAtom } from "../../../common";
import type { SongTableStateRepository } from "../../repositories/SongTableStateRepository";
import { songTableStateAsyncAtom } from "./songTableAtom";
import { songTableColumnViewAtom } from "./songTableColumnViewAtom";
import { songTableDeviceLayoutAtom } from "./songTableDeviceLayoutAtom";
import { songTableStateRepositoryAtom } from "./songTableStateRepositoryAtom";

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
		fetch: async () => create(SongTableStateSchema, {}),
		save: async () => {},
	};
}

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("songTableColumnViewAtom", () => {
	it("is undefined until the server document and the device layout have both resolved", async () => {
		const store = createStore();
		store.set(
			deviceSettingsRepositoryAtom,
			createFakeDeviceSettingsRepository(),
		);
		store.set(
			songTableStateRepositoryAtom,
			createFakeSongTableStateRepository(),
		);

		expect(store.get(songTableColumnViewAtom)).toBeUndefined();
	});

	it("composes tag order from the server with width/sort from the device", async () => {
		const store = createStore();
		store.set(
			deviceSettingsRepositoryAtom,
			createFakeDeviceSettingsRepository(),
		);
		store.set(
			songTableStateRepositoryAtom,
			createFakeSongTableStateRepository(),
		);
		store.set(
			songTableStateAsyncAtom,
			Promise.resolve(
				create(SongTableStateSchema, {
					columnTags: [Song_MetadataTag.TITLE, Song_MetadataTag.ARTIST],
				}),
			),
		);
		store.get(songTableDeviceLayoutAtom); // primes device layout hydration
		await flush();
		store.set(songTableDeviceLayoutAtom, {
			widthFlexByTag: { [Song_MetadataTag.TITLE]: 250 },
			sort: [{ tag: Song_MetadataTag.TITLE, isDesc: true }],
		});
		store.get(songTableColumnViewAtom); // primes server state hydration
		await flush();

		const result = store.get(songTableColumnViewAtom);

		expect(result).toEqual([
			{
				tag: Song_MetadataTag.TITLE,
				widthFlex: 250,
				sortOrder: 0,
				isSortDesc: true,
			},
			{
				tag: Song_MetadataTag.ARTIST,
				widthFlex: 1,
				sortOrder: undefined,
				isSortDesc: false,
			},
		]);
	});

	it("re-evaluates when the device layout changes (reactivity regression)", async () => {
		const store = createStore();
		store.set(
			deviceSettingsRepositoryAtom,
			createFakeDeviceSettingsRepository(),
		);
		store.set(
			songTableStateRepositoryAtom,
			createFakeSongTableStateRepository(),
		);
		store.set(
			songTableStateAsyncAtom,
			Promise.resolve(
				create(SongTableStateSchema, {
					columnTags: [Song_MetadataTag.TITLE],
				}),
			),
		);
		store.get(songTableDeviceLayoutAtom);
		await flush();
		store.get(songTableColumnViewAtom);
		await flush();

		expect(store.get(songTableColumnViewAtom)?.[0].widthFlex).toBe(1);

		store.set(songTableDeviceLayoutAtom, {
			widthFlexByTag: { [Song_MetadataTag.TITLE]: 400 },
			sort: [],
		});

		expect(store.get(songTableColumnViewAtom)?.[0].widthFlex).toBe(400);
	});
});
