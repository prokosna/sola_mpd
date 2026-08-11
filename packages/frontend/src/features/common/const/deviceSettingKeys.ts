export const DEVICE_SETTING_KEY_ADVANCED_SEARCH_QUERY_LIMIT =
	"advancedSearchQueryLimit";
export const DEVICE_SETTING_KEY_LOCALE = "locale";
export const DEVICE_SETTING_KEY_SELECTED_PROFILE_NAME = "selectedProfileName";
export const DEVICE_SETTING_KEY_SIMILARITY_SEARCH_TYPE = "similaritySearchType";
export const DEVICE_SETTING_KEY_SONG_TABLE_COLUMN_LAYOUT =
	"songTableColumnLayout";
export const DEVICE_SETTING_KEY_TEXT_TO_MUSIC_TYPE = "textToMusicType";

const DEVICE_KEY_PREFIX = "sola:v1:device:";

/** Builds `sola:v1:device:<key>`. */
export function buildDeviceSettingKey(key: string): string {
	return `${DEVICE_KEY_PREFIX}${key}`;
}
