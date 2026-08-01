import type { BrowserState } from "@sola_mpd/shared/src/models/browser_pb.js";
import { atom } from "jotai";

import { showNotification } from "../../../../../lib/mantine/showNotification";
import { UpdateMode } from "../../../../../types/stateTypes";
import { browserStateAsyncAtom } from "../atoms/browserStateAtom";
import { browserStateRepositoryAtom } from "../atoms/browserStateRepositoryAtom";

export const updateBrowserStateActionAtom = atom(
	null,
	async (get, set, args: { state: BrowserState; mode: UpdateMode }) => {
		const { state, mode } = args;
		if (mode & UpdateMode.PERSIST) {
			try {
				await get(browserStateRepositoryAtom).save(state);
			} catch (e) {
				console.error(e);
				showNotification({
					title: "Could not save browser state",
					description: e instanceof Error ? e.message : String(e),
					status: "error",
				});
				return;
			}
		}
		if (mode & UpdateMode.LOCAL_STATE) {
			set(browserStateAsyncAtom, state);
		}
	},
);
