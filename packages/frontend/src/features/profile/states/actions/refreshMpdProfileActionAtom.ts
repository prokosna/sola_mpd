import { atom } from "jotai";
import { RESET } from "jotai/utils";

import { mpdProfileStateAsyncAtom } from "../atoms/mpdProfileAtom";

export const refreshMpdProfileActionAtom = atom(null, (_get, set) => {
	set(mpdProfileStateAsyncAtom, RESET);
});
