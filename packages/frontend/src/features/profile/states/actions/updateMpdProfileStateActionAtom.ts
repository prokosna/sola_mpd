import type { MpdProfileState } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { atom } from "jotai";

import { showNotification } from "../../../../lib/mantine/showNotification";
import { UpdateMode } from "../../../../types/stateTypes";
import { mpdProfileStateAsyncAtom } from "../atoms/mpdProfileAtom";
import { mpdProfileStateRepositoryAtom } from "../atoms/mpdProfileStateRepositoryAtom";

export const updateMpdProfileStateActionAtom = atom(
	null,
	async (get, set, params: { state: MpdProfileState; mode: UpdateMode }) => {
		if (params.mode & UpdateMode.PERSIST) {
			try {
				await get(mpdProfileStateRepositoryAtom).save(params.state);
			} catch (e) {
				console.error(e);
				showNotification({
					title: "Could not save MPD profiles",
					description: e instanceof Error ? e.message : String(e),
					status: "error",
				});
				return;
			}
		}
		if (params.mode & UpdateMode.LOCAL_STATE) {
			set(mpdProfileStateAsyncAtom, Promise.resolve(params.state));
		}
	},
);
