import { describe, expect, it, vi } from "vitest";
import type { DeviceSettingsRepository } from "../../common";
import {
	buildDeviceProfileSettingKey,
	buildDeviceSettingKey,
	DEVICE_SETTING_KEY_BROWSER_LAST_POSITION,
	DEVICE_SETTING_KEY_SELECTED_PROFILE_NAME,
	DEVICE_SETTING_KEY_SONG_TABLE_COLUMN_LAYOUT,
} from "../../common";
import { sweepOrphanedProfileDeviceSettings } from "./sweepOrphanedProfileDeviceSettings";

function createFakeDeviceSettingsRepository(
	initialKeys: string[],
): DeviceSettingsRepository {
	const backing = new Set(initialKeys);
	return {
		get: vi.fn() as DeviceSettingsRepository["get"],
		set: vi.fn() as DeviceSettingsRepository["set"],
		remove: vi.fn((key: string) => {
			backing.delete(key);
		}) as DeviceSettingsRepository["remove"],
		listKeys: vi.fn((prefix: string) =>
			[...backing].filter((key) => key.startsWith(prefix)),
		) as DeviceSettingsRepository["listKeys"],
	};
}

describe("sweepOrphanedProfileDeviceSettings", () => {
	it("removes per-profile keys for profiles absent from the valid list and keeps the rest", () => {
		const homeKey = buildDeviceProfileSettingKey(
			"Home",
			DEVICE_SETTING_KEY_BROWSER_LAST_POSITION,
		);
		const deletedKey = buildDeviceProfileSettingKey(
			"Deleted",
			DEVICE_SETTING_KEY_BROWSER_LAST_POSITION,
		);
		const repo = createFakeDeviceSettingsRepository([homeKey, deletedKey]);

		sweepOrphanedProfileDeviceSettings(repo, ["Home"]);

		expect(repo.remove).toHaveBeenCalledTimes(1);
		expect(repo.remove).toHaveBeenCalledWith(deletedKey);
		expect(repo.listKeys("sola:v1:device:profile:")).toEqual([homeKey]);
	});

	it("leaves plain, non-per-profile keys alone", () => {
		const selectedProfileNameKey = buildDeviceSettingKey(
			DEVICE_SETTING_KEY_SELECTED_PROFILE_NAME,
		);
		const songTableColumnLayoutKey = buildDeviceSettingKey(
			DEVICE_SETTING_KEY_SONG_TABLE_COLUMN_LAYOUT,
		);
		const repo = createFakeDeviceSettingsRepository([
			selectedProfileNameKey,
			songTableColumnLayoutKey,
		]);

		sweepOrphanedProfileDeviceSettings(repo, []);

		expect(repo.remove).not.toHaveBeenCalled();
	});

	it("matches a profile name containing ':' correctly instead of partially parsing it", () => {
		const key = buildDeviceProfileSettingKey(
			"work:laptop:mpd",
			DEVICE_SETTING_KEY_BROWSER_LAST_POSITION,
		);
		const repo = createFakeDeviceSettingsRepository([key]);

		sweepOrphanedProfileDeviceSettings(repo, ["work:laptop:mpd"]);

		expect(repo.remove).not.toHaveBeenCalled();

		sweepOrphanedProfileDeviceSettings(repo, ["some-other-profile"]);

		expect(repo.remove).toHaveBeenCalledTimes(1);
		expect(repo.remove).toHaveBeenCalledWith(key);
	});
});
