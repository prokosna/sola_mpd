import { atom } from "jotai";
import { atomWithDefault } from "jotai/utils";
import {
	buildDeviceSettingKey,
	DEVICE_SETTING_KEY_SELECTED_PROFILE_NAME,
	deviceSettingsRepositoryAtom,
} from "../../../common";

const selectedProfileNameKey = buildDeviceSettingKey(
	DEVICE_SETTING_KEY_SELECTED_PROFILE_NAME,
);

// atomWithDefault is what puts this value on Jotai's dependency graph.
// DeviceSettingsRepository.get() is synchronous and non-reactive, so reading it
// directly would leave the screen unchanged when the selection does change.
const selectedProfileNameBaseAtom = atomWithDefault<string | undefined>((get) =>
	get(deviceSettingsRepositoryAtom).get<string>(selectedProfileNameKey),
);

export const selectedProfileNameAtom = atom(
	(get) => get(selectedProfileNameBaseAtom),
	(get, set, name: string | undefined) => {
		set(selectedProfileNameBaseAtom, name);
		const repository = get(deviceSettingsRepositoryAtom);
		if (name === undefined) {
			repository.remove(selectedProfileNameKey);
		} else {
			repository.set(selectedProfileNameKey, name);
		}
	},
);
