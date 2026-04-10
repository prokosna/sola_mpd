import { atom } from "jotai";

import type { MpdClient } from "../../services/MpdClient";
import { mpdClientAtom } from "../atoms/mpdClientAtom";

export const setMpdClientActionAtom = atom(
	null,
	(_get, set, mpdClient: MpdClient) => {
		set(mpdClientAtom, mpdClient);
	},
);
