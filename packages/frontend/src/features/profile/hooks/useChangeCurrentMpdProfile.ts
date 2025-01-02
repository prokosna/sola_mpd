import { useCallback } from "react";

import { UpdateMode } from "../../../types/stateTypes";
import {
	useMpdProfileState,
	useUpdateCurrentMpdProfile,
} from "../states/mpdProfileState";

/**
 * Hook for switching active MPD profile.
 *
 * @returns Profile update function
 */
export function useChangeCurrentMpdProfile() {
	const mpdProfileState = useMpdProfileState();
	const updateCurrentMpdProfile = useUpdateCurrentMpdProfile();

	return useCallback(
		async (name: string) => {
			if (mpdProfileState === undefined) {
				return;
			}

			const profile = mpdProfileState.profiles.find(
				(profile) => profile.name === name,
			);
			if (profile === undefined) {
				return;
			}

			return updateCurrentMpdProfile(
				profile,
				UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
			);
		},
		[mpdProfileState, updateCurrentMpdProfile],
	);
}
