import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { createStore } from "jotai";
import { describe, expect, it } from "vitest";

import type { DeviceSettingsRepository } from "../../../common";
import { deviceSettingsRepositoryAtom } from "../../../common";
import type { SongTableStateRepository } from "../../repositories/SongTableStateRepository";
import { songTableDeviceLayoutAtom } from "../atoms/songTableDeviceLayoutAtom";
import { songTableStateRepositoryAtom } from "../atoms/songTableStateRepositoryAtom";
import { resetSongTableSearchWidthActionAtom } from "./resetSongTableSearchWidthActionAtom";

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
		fetch: async () => {
			throw new Error("not needed for these tests");
		},
		save: async () => {},
	};
}

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

async function createReadyStore() {
	const store = createStore();
	store.set(deviceSettingsRepositoryAtom, createFakeDeviceSettingsRepository());
	store.set(songTableStateRepositoryAtom, createFakeSongTableStateRepository());
	store.get(songTableDeviceLayoutAtom);
	await flush();
	return store;
}

describe("resetSongTableSearchWidthActionAtom", () => {
	it("drops one search's width map, leaving the shared map and other searches' widths untouched", async () => {
		const store = await createReadyStore();
		store.set(songTableDeviceLayoutAtom, {
			widthFlexByTag: { [Song_MetadataTag.ARTIST]: 100 },
			sort: [{ tag: Song_MetadataTag.ARTIST, isDesc: false }],
			widthFlexByTagBySearchName: {
				Rock: { [Song_MetadataTag.TITLE]: 250 },
				Jazz: { [Song_MetadataTag.ALBUM]: 400 },
			},
		});

		store.set(resetSongTableSearchWidthActionAtom, "Rock");

		const layout = store.get(songTableDeviceLayoutAtom);
		expect(layout?.widthFlexByTagBySearchName).toEqual({
			Jazz: { [Song_MetadataTag.ALBUM]: 400 },
		});
		expect(layout?.widthFlexByTag).toEqual({ [Song_MetadataTag.ARTIST]: 100 });
		expect(layout?.sort).toEqual([
			{ tag: Song_MetadataTag.ARTIST, isDesc: false },
		]);
	});

	it("is a no-op when the search has no width entry", async () => {
		const store = await createReadyStore();
		const layout = {
			widthFlexByTag: { [Song_MetadataTag.ARTIST]: 100 },
			sort: [],
		};
		store.set(songTableDeviceLayoutAtom, layout);

		store.set(resetSongTableSearchWidthActionAtom, "Rock");

		expect(store.get(songTableDeviceLayoutAtom)).toEqual(layout);
	});
});
