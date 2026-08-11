import { atom } from "jotai";

import {
	loadMpdProfileState,
	mpdProfileStateAsyncAtom,
} from "../atoms/mpdProfileAtom";

// Assigns a freshly fetched value: `set(xAsyncAtom, RESET)` is a no-op on an
// atomWithDefault the client has never locally written, so the refetch a
// peer's broadcast asks for would silently not happen.
export const refreshMpdProfileActionAtom = atom(null, async (get, set) => {
	const state = await loadMpdProfileState(get);
	set(mpdProfileStateAsyncAtom, state);
});
