import { clone, create } from "@bufbuild/protobuf";
import {
	MpdProfileSchema,
	MpdProfileStateSchema,
} from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { useCallback } from "react";

import { UpdateMode } from "../../../types/stateTypes";
import {
	useMpdProfileState,
	useUpdateMpdProfileState,
} from "../states/mpdProfileState";
import type { ProfileInput } from "../types/profileTypes";

/**
 * Hook for adding new MPD profiles.
 *
 * @returns Profile creation function
 * @throws When state is not ready
 */
export function useAddMpdProfile() {
	const mpdProfileState = useMpdProfileState();
	const updateMpdProfileState = useUpdateMpdProfileState();

	return useCallback(
		async (input: ProfileInput) => {
			if (mpdProfileState === undefined) {
				throw Error("MpdProfileState is not ready.");
			}

			const profile = create(MpdProfileSchema, {
				name: input.name,
				host: input.host,
				port: input.port,
			});

			const newMpdProfileState = clone(MpdProfileStateSchema, mpdProfileState);
			newMpdProfileState.profiles.push(profile);
			if (newMpdProfileState.currentProfile === undefined) {
				newMpdProfileState.currentProfile = profile;
			}

			return updateMpdProfileState(
				newMpdProfileState,
				UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
			);
		},
		[mpdProfileState, updateMpdProfileState],
	);
}
