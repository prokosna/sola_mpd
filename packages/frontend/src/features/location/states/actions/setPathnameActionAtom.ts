import { atom } from "jotai";

import { pathnameAtom } from "../atoms/locationAtom";

export const setPathnameActionAtom = atom(
	null,
	(_get, set, pathname: string) => {
		set(pathnameAtom, pathname);
	},
);
