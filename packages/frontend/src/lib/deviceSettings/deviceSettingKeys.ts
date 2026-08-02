// Setting names, referenced by callers instead of string literals so a typo
// can't silently create a brand-new, never-read key.
export const DEVICE_SETTING_KEY_SELECTED_PROFILE_NAME = "selectedProfileName";
export const DEVICE_SETTING_KEY_SONG_TABLE_COLUMN_LAYOUT =
	"songTableColumnLayout";
export const DEVICE_SETTING_KEY_BROWSER_LAST_POSITION = "browser-last-position";
export const DEVICE_SETTING_KEY_RECENTLY_ADDED_LAST_POSITION =
	"recently-added-last-position";
export const DEVICE_SETTING_KEY_VIEW_STATE_BLOB_TOKEN = "view-state-blob-token";

const DEVICE_KEY_PREFIX = "sola:v1:device:";
/** Exported so callers (e.g. the profile-deletion sweep) can list per-profile keys without re-deriving the prefix. */
export const DEVICE_PROFILE_KEY_PREFIX = "sola:v1:device:profile:";

/** Builds `sola:v1:device:<key>`. */
export function buildDeviceSettingKey(key: string): string {
	return `${DEVICE_KEY_PREFIX}${key}`;
}

/** Builds `sola:v1:device:profile:<profileName>:<key>`. */
export function buildDeviceProfileSettingKey(
	profileName: string,
	key: string,
): string {
	return `${DEVICE_PROFILE_KEY_PREFIX}${profileName}:${key}`;
}

export interface ParsedDeviceProfileSettingKey {
	profileName: string;
	key: string;
}

/**
 * Parses `sola:v1:device:profile:<profileName>:<key>`, returning `undefined`
 * for anything that doesn't match.
 *
 * Profile names are user-chosen and may themselves contain `:`, but the
 * trailing `key` segment is always one of the fixed `DEVICE_SETTING_KEY_*`
 * constants, none of which contain `:`. Splitting on the *last* `:` therefore
 * round-trips correctly regardless of what the profile name contains.
 */
export function parseDeviceProfileSettingKey(
	fullKey: string,
): ParsedDeviceProfileSettingKey | undefined {
	if (!fullKey.startsWith(DEVICE_PROFILE_KEY_PREFIX)) {
		return undefined;
	}
	const rest = fullKey.slice(DEVICE_PROFILE_KEY_PREFIX.length);
	const lastColonIndex = rest.lastIndexOf(":");
	if (lastColonIndex === -1) {
		return undefined;
	}
	const profileName = rest.slice(0, lastColonIndex);
	const key = rest.slice(lastColonIndex + 1);
	if (profileName.length === 0 || key.length === 0) {
		return undefined;
	}
	return { profileName, key };
}
