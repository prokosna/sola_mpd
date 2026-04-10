import { atom } from "jotai";

import { playerStatusAsyncAtom } from "../atoms/playerStatusAtom";

export const refreshPlayerStatusActionAtom = atom(null, (_get, set) => {
	set(playerStatusAsyncAtom);
});
