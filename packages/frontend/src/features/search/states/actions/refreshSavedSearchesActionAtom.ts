import { atom } from "jotai";

import { savedSearchesAsyncAtom } from "../atoms/savedSearchesAtom";
import { savedSearchesRepositoryAtom } from "../atoms/savedSearchesRepositoryAtom";

// Assigns a freshly fetched value: `set(xAsyncAtom, RESET)` is a no-op on an
// atomWithDefault the client has never locally written, so the refetch a
// peer's broadcast asks for would silently not happen.
export const refreshSavedSearchesActionAtom = atom(null, async (get, set) => {
	const repository = get(savedSearchesRepositoryAtom);
	const state = await repository.fetch();
	set(savedSearchesAsyncAtom, state);
});
