export const DEVICE_SETTING_KEY_SELECTED_PROFILE_NAME = "selectedProfileName";
export const DEVICE_SETTING_KEY_SONG_TABLE_COLUMN_LAYOUT =
	"songTableColumnLayout";

const DEVICE_KEY_PREFIX = "sola:v1:device:";

/** Builds `sola:v1:device:<key>`. */
export function buildDeviceSettingKey(key: string): string {
	return `${DEVICE_KEY_PREFIX}${key}`;
}
