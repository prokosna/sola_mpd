import { atom } from "jotai";

import { mpdProfileStateAtom } from "../atoms/mpdProfileAtom";
import { selectedProfileNameAtom } from "../atoms/selectedProfileNameAtom";

/**
 * Switches the profile this device plays from. Writes the device-scoped
 * selection only: the workspace default (MpdProfileState.currentProfile) is a
 * separate, deliberate choice made in Settings.
 *
 * Resolving the name against the known profiles happens here rather than at
 * the call site so an unknown name is rejected on the one write path.
 */
export const changeCurrentMpdProfileActionAtom = atom(
	null,
	(get, set, name: string) => {
		const mpdProfileState = get(mpdProfileStateAtom);
		if (mpdProfileState === undefined) {
			return;
		}
		const profile = mpdProfileState.profiles.find(
			(profile) => profile.name === name,
		);
		if (profile === undefined) {
			return;
		}
		set(selectedProfileNameAtom, profile.name);
	},
);
