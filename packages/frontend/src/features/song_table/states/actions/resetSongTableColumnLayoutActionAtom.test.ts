import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { createStore } from "jotai";
import { describe, expect, it } from "vitest";
import { buildDeviceSettingKey } from "../../../common/const/deviceSettingKeys";
import type { DeviceSettingsRepository } from "../../../common/repositories/DeviceSettingsRepository";
import { deviceSettingsRepositoryAtom } from "../../../common/states/atoms/deviceSettingsRepositoryAtom";
import { songTableColumnLayoutKeyForTag } from "../../functions/songTableColumnLayout";
import type { SongTableColumnLayout } from "../../types/songTableTypes";
import { songTableColumnLayoutAtom } from "../atoms/songTableColumnLayoutAtom";
import { resetSongTableColumnLayoutActionAtom } from "./resetSongTableColumnLayoutActionAtom";

const SONG_TABLE_COLUMN_LAYOUT_KEY = buildDeviceSettingKey(
	"songTableColumnLayout",
);
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

describe("resetSongTableColumnLayoutActionAtom", () => {
	it("clears the device column layout and leaves other device settings untouched", () => {
		const layout: SongTableColumnLayout = {
			[songTableColumnLayoutKeyForTag(Song_MetadataTag.TITLE)]: {
				widthFlex: 250,
				sortOrder: 0,
				isSortDesc: true,
			},
		};
		const repository = createFakeDeviceSettingsRepository({
			[SONG_TABLE_COLUMN_LAYOUT_KEY]: layout,
			[OTHER_DEVICE_SETTING_KEY]: "Home",
		});
		const store = createStore();
		store.set(deviceSettingsRepositoryAtom, repository);
		store.set(songTableColumnLayoutAtom, layout);

		store.set(resetSongTableColumnLayoutActionAtom);

		expect(store.get(songTableColumnLayoutAtom)).toEqual({});
		expect(repository.get(SONG_TABLE_COLUMN_LAYOUT_KEY)).toEqual({});
		expect(repository.get(OTHER_DEVICE_SETTING_KEY)).toBe("Home");
	});
});
