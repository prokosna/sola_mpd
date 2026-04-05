import { atom } from "jotai";
import { RESET } from "jotai/utils";

import { browserStateAsyncAtom } from "../atoms/browserStateAtom";

export const refreshBrowserStateActionAtom = atom(null, (_get, set) => {
	set(browserStateAsyncAtom, RESET);
});
