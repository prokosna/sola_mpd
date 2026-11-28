import { clone } from "@bufbuild/protobuf";
import {
	type MpdProfile,
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
		const newMpdProfileState = clone(MpdProfileStateSchema, mpdProfileState);
		const target = newMpdProfileState.profiles.find(
			(profile) => profile.name === params.profile.name,
		);
		if (target === undefined) {
			showNotification({
				title: "Could not switch MPD profile",
				description: `Profile "${params.profile.name}" no longer exists.`,
				status: "error",
			});
			return false;
		}
		newMpdProfileState.currentProfile = target;
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
				return false;
			}
		}
		if (params.mode & UpdateMode.LOCAL_STATE) {
			set(mpdProfileStateAsyncAtom, Promise.resolve(newMpdProfileState));
		}
		return true;
	},
);
