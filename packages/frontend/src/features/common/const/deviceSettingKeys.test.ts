import { describe, expect, it } from "vitest";

import {
	buildDeviceSettingKey,
	DEVICE_SETTING_KEY_SELECTED_PROFILE_NAME,
} from "./deviceSettingKeys";

describe("buildDeviceSettingKey", () => {
	it("namespaces a key so it cannot collide with another app's storage", () => {
		expect(
			buildDeviceSettingKey(DEVICE_SETTING_KEY_SELECTED_PROFILE_NAME),
		).toBe("sola:v1:device:selectedProfileName");
	});
});
