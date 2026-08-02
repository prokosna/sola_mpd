import { describe, expect, it } from "vitest";

import {
	buildDeviceProfileSettingKey,
	buildDeviceSettingKey,
	DEVICE_SETTING_KEY_BROWSER_LAST_POSITION,
	parseDeviceProfileSettingKey,
} from "./deviceSettingKeys";

describe("buildDeviceSettingKey", () => {
	it("builds a plain device key", () => {
		expect(buildDeviceSettingKey("selectedProfileName")).toBe(
			"sola:v1:device:selectedProfileName",
		);
	});
});

describe("buildDeviceProfileSettingKey", () => {
	it("builds a per-profile device key", () => {
		expect(
			buildDeviceProfileSettingKey(
				"Home",
				DEVICE_SETTING_KEY_BROWSER_LAST_POSITION,
			),
		).toBe("sola:v1:device:profile:Home:browser-last-position");
	});
});

describe("parseDeviceProfileSettingKey", () => {
	it("round-trips a simple profile name", () => {
		const key = buildDeviceProfileSettingKey(
			"Home",
			DEVICE_SETTING_KEY_BROWSER_LAST_POSITION,
		);

		expect(parseDeviceProfileSettingKey(key)).toEqual({
			profileName: "Home",
			key: DEVICE_SETTING_KEY_BROWSER_LAST_POSITION,
		});
	});

	it("round-trips a profile name containing colons", () => {
		const profileName = "work:laptop:mpd";
		const key = buildDeviceProfileSettingKey(
			profileName,
			DEVICE_SETTING_KEY_BROWSER_LAST_POSITION,
		);

		expect(parseDeviceProfileSettingKey(key)).toEqual({
			profileName,
			key: DEVICE_SETTING_KEY_BROWSER_LAST_POSITION,
		});
	});

	it("rejects a plain (non-profile) device key", () => {
		expect(
			parseDeviceProfileSettingKey("sola:v1:device:selectedProfileName"),
		).toBeUndefined();
	});

	it("rejects a key with no profile-name segment", () => {
		expect(
			parseDeviceProfileSettingKey("sola:v1:device:profile::key"),
		).toBeUndefined();
	});

	it("rejects an unrelated string", () => {
		expect(parseDeviceProfileSettingKey("not-a-device-key")).toBeUndefined();
	});
});
