import { atom } from "jotai";

import { browserStateAsyncAtom } from "../atoms/browserStateAtom";
import { browserStateRepositoryAtom } from "../atoms/browserStateRepositoryAtom";

// Fetches and assigns a fresh value rather than `set(browserStateAsyncAtom,
// RESET)`: atomWithDefault's RESET only re-triggers the default initializer
// if the atom was previously overwritten with a concrete value (e.g. by
// updateBrowserStateActionAtom's LOCAL_STATE path). A client that has never
// locally written this atom stays at its untouched default forever — RESET
// there is a same-value write, which jotai bails out of as a no-op — so a
// peer's config-changed broadcast would silently fail to refetch. Assigning
// a freshly fetched (always distinct) value sidesteps that entirely.
export const refreshBrowserStateActionAtom = atom(null, async (get, set) => {
	const repository = get(browserStateRepositoryAtom);
	const state = await repository.fetch();
	set(browserStateAsyncAtom, state);
});
