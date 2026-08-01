import { clone, toJsonString } from "@bufbuild/protobuf";
import {
	type MpdProfile,
	MpdProfileSchema,
	MpdProfileStateSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { atom } from "jotai";

import { showNotification } from "../../../../lib/mantine/showNotification";
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
		if (params.mode & UpdateMode.PERSIST) {
			try {
				await get(mpdProfileStateRepositoryAtom).save(newMpdProfileState);
			} catch (e) {
				console.error(e);
				showNotification({
					title: "Could not switch MPD profile",
					description: e instanceof Error ? e.message : String(e),
					status: "error",
				});
				return;
			}
		}
		if (params.mode & UpdateMode.LOCAL_STATE) {
			set(mpdProfileStateAsyncAtom, Promise.resolve(newMpdProfileState));
		}
	},
);
