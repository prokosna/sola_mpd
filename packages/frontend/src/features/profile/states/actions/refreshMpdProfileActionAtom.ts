import { atom } from "jotai";

import {
	loadMpdProfileState,
	mpdProfileStateAsyncAtom,
} from "../atoms/mpdProfileAtom";

// Fetches and assigns a fresh value rather than
// `set(mpdProfileStateAsyncAtom, RESET)`: atomWithDefault's RESET only
// re-triggers the default initializer if the atom was previously overwritten
// with a concrete value. A client that has never locally written this atom
// stays at its untouched default forever — RESET there is a same-value
// write, which jotai bails out of as a no-op — so a peer's config-changed
// broadcast would silently fail to refetch. Calling the same loader the
// initializer uses (and assigning its always-distinct result) sidesteps
// that entirely while still running the orphaned-device-settings sweep.
export const refreshMpdProfileActionAtom = atom(null, async (get, set) => {
	const state = await loadMpdProfileState(get);
	set(mpdProfileStateAsyncAtom, state);
});
