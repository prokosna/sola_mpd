import { atom } from "jotai";

import { transitionCounterAtom } from "../atoms/locationAtom";

export const incrementTransitionCounterActionAtom = atom(null, (get, set) => {
	set(transitionCounterAtom, get(transitionCounterAtom) + 1);
});
