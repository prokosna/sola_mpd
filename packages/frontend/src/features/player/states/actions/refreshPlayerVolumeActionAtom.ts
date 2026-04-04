import { atom } from "jotai";

import { playerVolumeAsyncAtom } from "../atoms/playerVolumeAtom";

export const refreshPlayerVolumeActionAtom = atom(null, (_get, set) => {
	set(playerVolumeAsyncAtom);
});
