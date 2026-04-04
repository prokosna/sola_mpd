import { atom } from "jotai";

import { isPlaylistLoadingAtom } from "../atoms/playlistUiAtom";

export const setIsPlaylistLoadingActionAtom = atom(
	null,
	(_get, set, isLoading: boolean) => {
		set(isPlaylistLoadingAtom, isLoading);
	},
);
