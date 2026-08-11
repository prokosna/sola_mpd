import { atom } from "jotai";

import { browserStateAsyncAtom } from "../atoms/browserStateAtom";
import { browserStateRepositoryAtom } from "../atoms/browserStateRepositoryAtom";

// Assigns a freshly fetched value: `set(xAsyncAtom, RESET)` is a no-op on an
// atomWithDefault the client has never locally written, so the refetch a
// peer's broadcast asks for would silently not happen.
export const refreshBrowserStateActionAtom = atom(null, async (get, set) => {
	const repository = get(browserStateRepositoryAtom);
	const state = await repository.fetch();
	set(browserStateAsyncAtom, state);
});
