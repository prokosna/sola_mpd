// Const
export {
	buildDeviceProfileSettingKey,
	buildDeviceSettingKey,
	DEVICE_PROFILE_KEY_PREFIX,
	DEVICE_SETTING_KEY_BROWSER_LAST_POSITION,
	DEVICE_SETTING_KEY_RECENTLY_ADDED_LAST_POSITION,
	DEVICE_SETTING_KEY_SELECTED_PROFILE_NAME,
	DEVICE_SETTING_KEY_SONG_TABLE_COLUMN_LAYOUT,
	DEVICE_SETTING_KEY_VIEW_STATE_BLOB_TOKEN,
	type ParsedDeviceProfileSettingKey,
	parseDeviceProfileSettingKey,
} from "./const/deviceSettingKeys";
// Repositories
export type { DeviceSettingsRepository } from "./repositories/DeviceSettingsRepository";
export { DeviceSettingsRepositoryLocalStorage } from "./repositories/DeviceSettingsRepositoryLocalStorage";
export type { StateRepository } from "./repositories/StateRepository";
export { StateRepositoryHttp } from "./repositories/StateRepositoryHttp";
export { StateRepositorySocketIo } from "./repositories/StateRepositorySocketIo";
// States
export { deviceSettingsRepositoryAtom } from "./states/atoms/deviceSettingsRepositoryAtom";
export { createStateRepositoryAtom } from "./states/atoms/stateRepositoryAtom";

// handleConfigChangedActionAtom is deliberately absent. It fans out to the
// refresh action of all six config documents, so re-exporting it here — from
// the one barrel nearly every other feature imports — would make importing,
// say, a device setting key pull in most of the app and close an import cycle
// back onto the importing feature. Its only consumer is useJotaiStore.tsx,
// which is the composition root and deep-imports every wiring target anyway.
