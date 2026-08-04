import type { DeviceSettingsRepository } from "../../common";
import {
	DEVICE_PROFILE_KEY_PREFIX,
	parseDeviceProfileSettingKey,
} from "../../common";

/**
 * Deletes per-profile device settings (`sola:v1:device:profile:<name>:*`)
 * whose profile no longer exists. A profile's name is its only identifier
 * (no UUID, no rename UI), so deleting and later recreating a profile with
 * the same name is possible; without this sweep, the new profile would
 * silently inherit the deleted one's cached browsing position — a
 * correctness bug, not just leftover storage.
 */
export function sweepOrphanedProfileDeviceSettings(
	repo: DeviceSettingsRepository,
	validProfileNames: string[],
): void {
	const validNames = new Set(validProfileNames);
	for (const key of repo.listKeys(DEVICE_PROFILE_KEY_PREFIX)) {
		const parsed = parseDeviceProfileSettingKey(key);
		if (parsed !== undefined && !validNames.has(parsed.profileName)) {
			repo.remove(key);
		}
	}
}
