import { clone, toJsonString } from "@bufbuild/protobuf";
import {
	type MpdProfile,
	MpdProfileSchema,
	MpdProfileStateSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { atom } from "jotai";

import { UpdateMode } from "../../../../types/stateTypes";
import { mpdProfileStateAsyncAtom } from "../atoms/mpdProfileAtom";
import { mpdProfileStateRepositoryAtom } from "../atoms/mpdProfileStateRepositoryAtom";

export const updateCurrentMpdProfileActionAtom = atom(
	null,
	async (get, set, params: { profile: MpdProfile; mode: UpdateMode }) => {
		const mpdProfileState = await get(mpdProfileStateAsyncAtom);
		if (!mpdProfileState.profiles.includes(params.profile)) {
			throw Error(
				`Invalid profile state: ${toJsonString(MpdProfileSchema, params.profile)} is not in profiles`,
			);
		}
		const newMpdProfileState = clone(MpdProfileStateSchema, mpdProfileState);
		newMpdProfileState.currentProfile = params.profile;
		if (params.mode & UpdateMode.LOCAL_STATE) {
			set(mpdProfileStateAsyncAtom, Promise.resolve(newMpdProfileState));
		}
		if (params.mode & UpdateMode.PERSIST) {
			const repository = get(mpdProfileStateRepositoryAtom);
			await repository.save(newMpdProfileState);
		}
	},
);
