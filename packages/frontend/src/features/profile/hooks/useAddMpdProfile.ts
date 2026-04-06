import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import { UpdateMode } from "../../../types/stateTypes";
import { buildMpdProfileStateWithNewProfile } from "../functions/profileConstruction";
import { updateMpdProfileStateActionAtom } from "../states/actions/updateMpdProfileStateActionAtom";
import { mpdProfileStateAtom } from "../states/atoms/mpdProfileAtom";
import type { ProfileInput } from "../types/profileTypes";

export function useAddMpdProfile() {
	const mpdProfileState = useAtomValue(mpdProfileStateAtom);
	const updateMpdProfileState = useSetAtom(updateMpdProfileStateActionAtom);

	return useCallback(
		async (input: ProfileInput) => {
			if (mpdProfileState === undefined) {
				throw Error("MpdProfileState is not ready.");
			}

			const newState = buildMpdProfileStateWithNewProfile(
				mpdProfileState,
				input,
			);

			return updateMpdProfileState({
				state: newState,
				mode: UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
			});
		},
		[mpdProfileState, updateMpdProfileState],
	);
}
