import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { createStore } from "jotai";
import { describe, expect, it } from "vitest";
import type { DeviceSettingsRepository } from "../../../common";
import {
	buildDeviceSettingKey,
	deviceSettingsRepositoryAtom,
} from "../../../common";
import type { SongTableDeviceLayout } from "../../types/songTableTypes";
import { songTableDeviceLayoutAtom } from "../atoms/songTableDeviceLayoutAtom";
import { resetSongTableColumnLayoutActionAtom } from "./resetSongTableColumnLayoutActionAtom";

const SONG_TABLE_LAYOUT_KEY = buildDeviceSettingKey("songTableLayout");
const OTHER_DEVICE_SETTING_KEY = buildDeviceSettingKey("selectedProfileName");

function createFakeDeviceSettingsRepository(
	initial: Record<string, unknown>,
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

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("resetSongTableColumnLayoutActionAtom", () => {
	it("clears the device column widths, leaves sort and other device settings untouched", async () => {
		const layout: SongTableDeviceLayout = {
			widthFlexByTag: { [Song_MetadataTag.TITLE]: 250 },
			sort: [{ tag: Song_MetadataTag.TITLE, isDesc: true }],
		};
		const repository = createFakeDeviceSettingsRepository({
			[SONG_TABLE_LAYOUT_KEY]: layout,
			[OTHER_DEVICE_SETTING_KEY]: "Home",
		});
		const store = createStore();
		store.set(deviceSettingsRepositoryAtom, repository);
		store.get(songTableDeviceLayoutAtom); // primes the async->sync unwrap
		await flush();

		store.set(resetSongTableColumnLayoutActionAtom);

		expect(store.get(songTableDeviceLayoutAtom)).toEqual({
			widthFlexByTag: {},
			sort: [{ tag: Song_MetadataTag.TITLE, isDesc: true }],
		});
		expect(repository.get(SONG_TABLE_LAYOUT_KEY)).toEqual({
			widthFlexByTag: {},
			sort: [{ tag: Song_MetadataTag.TITLE, isDesc: true }],
		});
		expect(repository.get(OTHER_DEVICE_SETTING_KEY)).toBe("Home");
	});
});
