import { atom } from "jotai";

import { songTableStateAsyncAtom } from "../atoms/songTableAtom";
import { songTableStateRepositoryAtom } from "../atoms/songTableStateRepositoryAtom";

// Fetches and assigns a fresh value rather than `set(songTableStateAsyncAtom,
// RESET)`: atomWithDefault's RESET only re-triggers the default initializer
// if the atom was previously overwritten with a concrete value. A client
// that has never locally written this atom stays at its untouched default
// forever — RESET there is a same-value write, which jotai bails out of as
// a no-op — so a peer's config-changed broadcast would silently fail to
// refetch. Assigning a freshly fetched (always distinct) value sidesteps
// that entirely.
export const refreshSongTableStateActionAtom = atom(null, async (get, set) => {
	const repository = get(songTableStateRepositoryAtom);
	const state = await repository.fetch();
	set(songTableStateAsyncAtom, state);
});
