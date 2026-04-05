import { clone, create } from "@bufbuild/protobuf";
import {
	MpdProfileSchema,
	MpdProfileStateSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { UpdateMode } from "../../../types/stateTypes";
import { updateMpdProfileStateActionAtom } from "../states/actions/updateMpdProfileStateActionAtom";
import { mpdProfileStateAtom } from "../states/atoms/mpdProfileAtom";
import type { ProfileInput } from "../types/profileTypes";

/**
 * Hook for adding new MPD profiles.
 *
 * @returns Profile creation function
 * @throws When state is not ready
 */
export function useAddMpdProfile() {
	const mpdProfileState = useAtomValue(mpdProfileStateAtom);
	const updateMpdProfileState = useSetAtom(updateMpdProfileStateActionAtom);

	return useCallback(
		async (input: ProfileInput) => {
			if (mpdProfileState === undefined) {
				throw Error("MpdProfileState is not ready.");
			}

			const profile = create(MpdProfileSchema, {
				name: input.name,
				host: input.host,
				port: input.port,
				password: input.password ?? "",
			});

			const newMpdProfileState = clone(MpdProfileStateSchema, mpdProfileState);
			newMpdProfileState.profiles.push(profile);
			if (newMpdProfileState.currentProfile === undefined) {
				newMpdProfileState.currentProfile = profile;
			}

			return updateMpdProfileState({
				state: newMpdProfileState,
				mode: UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
			});
		},
		[mpdProfileState, updateMpdProfileState],
	);
}
