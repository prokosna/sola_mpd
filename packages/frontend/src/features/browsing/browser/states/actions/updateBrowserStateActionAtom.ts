import type { BrowserState } from "@sola_mpd/shared/src/models/browser_pb.js";
import { atom } from "jotai";

import { UpdateMode } from "../../../../../types/stateTypes";
import { browserStateAsyncAtom } from "../atoms/browserStateAtom";
import { browserStateRepositoryAtom } from "../atoms/browserStateRepositoryAtom";

export const updateBrowserStateActionAtom = atom(
	null,
	async (get, set, args: { state: BrowserState; mode: UpdateMode }) => {
		const { state, mode } = args;
		if (mode & UpdateMode.LOCAL_STATE) {
			set(browserStateAsyncAtom, state);
		}
		if (mode & UpdateMode.PERSIST) {
			await get(browserStateRepositoryAtom).save(state);
		}
	},
);
