import { atom } from "jotai";

import { songTableStateAsyncAtom } from "../atoms/songTableAtom";
import { songTableStateRepositoryAtom } from "../atoms/songTableStateRepositoryAtom";

// Assigns a freshly fetched value: `set(xAsyncAtom, RESET)` is a no-op on an
// atomWithDefault the client has never locally written, so the refetch a
// peer's broadcast asks for would silently not happen.
export const refreshSongTableStateActionAtom = atom(null, async (get, set) => {
	const repository = get(songTableStateRepositoryAtom);
	const state = await repository.fetch();
	set(songTableStateAsyncAtom, state);
});
