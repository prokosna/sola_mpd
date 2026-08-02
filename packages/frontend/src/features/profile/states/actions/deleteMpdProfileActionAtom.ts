import { atom } from "jotai";

import { sweepOrphanedProfileDeviceSettings } from "../../../../lib/deviceSettings/sweepOrphanedProfileDeviceSettings";
import { showNotification } from "../../../../lib/mantine/showNotification";
import { deviceSettingsRepositoryAtom } from "../../../common/states/atoms/deviceSettingsRepositoryAtom";
import { removeProfileFromState } from "../../functions/profileConstruction";
import { mpdProfileStateAsyncAtom } from "../atoms/mpdProfileAtom";
import { mpdProfileStateRepositoryAtom } from "../atoms/mpdProfileStateRepositoryAtom";

export const deleteMpdProfileActionAtom = atom(
	null,
	async (get, set, params: { profileName: string }) => {
		const mpdProfileState = await get(mpdProfileStateAsyncAtom);
		const newState = removeProfileFromState(
			mpdProfileState,
			params.profileName,
		);
		if (newState === undefined) {
			return;
		}
		try {
			await get(mpdProfileStateRepositoryAtom).save(newState);
		} catch (e) {
			console.error(e);
			showNotification({
				title: "Could not delete MPD profile",
				description: e instanceof Error ? e.message : String(e),
				status: "error",
			});
			return;
		}
		set(mpdProfileStateAsyncAtom, Promise.resolve(newState));
		// Drop this profile's per-profile device settings immediately, in the
		// same step as the deletion, so a same-named profile created
		// later on this device doesn't inherit its cached browsing position.
		sweepOrphanedProfileDeviceSettings(
			get(deviceSettingsRepositoryAtom),
			newState.profiles.map((profile) => profile.name),
		);
	},
);
