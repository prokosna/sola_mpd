import type { MpdProfileState } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { atom, type Getter } from "jotai";
import { atomWithDefault } from "jotai/utils";
import { sweepOrphanedProfileDeviceSettings } from "../../../../lib/deviceSettings/sweepOrphanedProfileDeviceSettings";
import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import { deviceSettingsRepositoryAtom } from "../../../common/states/atoms/deviceSettingsRepositoryAtom";

import { mpdProfileStateRepositoryAtom } from "./mpdProfileStateRepositoryAtom";
import { selectedProfileNameAtom } from "./selectedProfileNameAtom";

// Shared by the atom's own initializer and refreshMpdProfileActionAtom (the
// Phase 4 broadcast-triggered refetch — see that file for why it fetches and
// assigns directly instead of using RESET). Sweeping here after every
// successful fetch covers the "other devices learn about a deletion only
// when they refetch the profile list" case from §8.1 in one place.
export async function loadMpdProfileState(
	get: Getter,
): Promise<MpdProfileState> {
	const repository = get(mpdProfileStateRepositoryAtom);
	const state = await repository.fetch();
	sweepOrphanedProfileDeviceSettings(
		get(deviceSettingsRepositoryAtom),
		state.profiles.map((profile) => profile.name),
	);
	return state;
}

export const mpdProfileStateAsyncAtom = atomWithDefault<
	Promise<MpdProfileState> | MpdProfileState
>(loadMpdProfileState);

export const mpdProfileStateAtom = atomWithSync(mpdProfileStateAsyncAtom);

// Selection is per-device, the default is per-workspace (server). The
// device's choice wins when it still names a profile that exists; a
// deleted-elsewhere server default falls back to the first remaining
// profile so the UI never points at a profile that no longer exists.
export const currentMpdProfileAtom = atom((get) => {
	const profileState = get(mpdProfileStateAtom);
	if (profileState === undefined) {
		return undefined;
	}

	const selectedProfileName = get(selectedProfileNameAtom);
	const selectedProfile = profileState.profiles.find(
		(profile) => profile.name === selectedProfileName,
	);
	if (selectedProfile !== undefined) {
		return selectedProfile;
	}

	const defaultProfile = profileState.profiles.find(
		(profile) => profile.name === profileState.currentProfile?.name,
	);
	if (defaultProfile !== undefined) {
		return defaultProfile;
	}

	return profileState.profiles[0];
});
