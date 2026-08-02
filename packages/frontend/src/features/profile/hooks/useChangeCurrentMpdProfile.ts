import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import { mpdProfileStateAtom } from "../states/atoms/mpdProfileAtom";
import { selectedProfileNameAtom } from "../states/atoms/selectedProfileNameAtom";

export function useChangeCurrentMpdProfile() {
	const mpdProfileState = useAtomValue(mpdProfileStateAtom);
	const setSelectedProfileName = useSetAtom(selectedProfileNameAtom);

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

			setSelectedProfileName(profile.name);
		},
		[mpdProfileState, setSelectedProfileName],
	);
}
