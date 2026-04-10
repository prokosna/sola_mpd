import { atom } from "jotai";

import { isPlayQueueLoadingAtom } from "../atoms/playQueueUiAtom";

export const setIsPlayQueueLoadingActionAtom = atom(
	null,
	(_get, set, isLoading: boolean) => {
		set(isPlayQueueLoadingAtom, isLoading);
	},
);
