import { atom } from "jotai";

import { playerClockAtom } from "../atoms/playerClockAtom";

export const tickPlayerClockActionAtom = atom(null, (_get, set) => {
	set(playerClockAtom, performance.now());
});
