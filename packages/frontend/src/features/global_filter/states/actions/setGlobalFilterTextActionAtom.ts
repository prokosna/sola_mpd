import { normalize } from "@sola_mpd/shared/src/utils/stringUtils.js";
import { atom } from "jotai";

import { globalFilterTextAtom } from "../atoms/globalFilterAtom";

export const setGlobalFilterTextActionAtom = atom(
	null,
	(_get, set, text: string) => {
		set(globalFilterTextAtom, normalize(text));
	},
);
