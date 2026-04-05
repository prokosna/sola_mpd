import type { MpdProfileState } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { atom } from "jotai";

import { UpdateMode } from "../../../../types/stateTypes";
import { mpdProfileStateAsyncAtom } from "../atoms/mpdProfileAtom";
import { mpdProfileStateRepositoryAtom } from "../atoms/mpdProfileStateRepositoryAtom";

export const updateMpdProfileStateActionAtom = atom(
	null,
	async (get, set, params: { state: MpdProfileState; mode: UpdateMode }) => {
		if (params.mode & UpdateMode.LOCAL_STATE) {
			set(mpdProfileStateAsyncAtom, Promise.resolve(params.state));
		}
		if (params.mode & UpdateMode.PERSIST) {
			const repository = get(mpdProfileStateRepositoryAtom);
			await repository.save(params.state);
		}
	},
);
