import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import { UpdateMode } from "../../../types/stateTypes";
import { updateCurrentMpdProfileActionAtom } from "../states/actions/updateCurrentMpdProfileActionAtom";
import { mpdProfileStateAtom } from "../states/atoms/mpdProfileAtom";

export function useChangeCurrentMpdProfile() {
	const mpdProfileState = useAtomValue(mpdProfileStateAtom);
	const updateCurrentMpdProfile = useSetAtom(updateCurrentMpdProfileActionAtom);

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

			return updateCurrentMpdProfile({
				profile,
				mode: UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
			});
		},
		[mpdProfileState, updateCurrentMpdProfile],
	);
}
