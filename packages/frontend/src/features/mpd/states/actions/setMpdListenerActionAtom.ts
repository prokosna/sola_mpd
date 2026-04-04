import { atom } from "jotai";

import type { MpdListener } from "../../services/MpdListener";
import { mpdListenerAtom } from "../atoms/mpdListenerAtom";

export const setMpdListenerActionAtom = atom(
	null,
	(_get, set, mpdListener: MpdListener) => {
		set(mpdListenerAtom, mpdListener);
	},
);
