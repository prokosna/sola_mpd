import { atom } from "jotai";

import { recentlyAddedStateAsyncAtom } from "../atoms/recentlyAddedStateAtom";
import { recentlyAddedStateRepositoryAtom } from "../atoms/recentlyAddedStateRepositoryAtom";

// Assigns a freshly fetched value: `set(xAsyncAtom, RESET)` is a no-op on an
// atomWithDefault the client has never locally written, so the refetch a
// peer's broadcast asks for would silently not happen.
export const refreshRecentlyAddedStateActionAtom = atom(
	null,
	async (get, set) => {
		const repository = get(recentlyAddedStateRepositoryAtom);
		const state = await repository.fetch();
		set(recentlyAddedStateAsyncAtom, state);
	},
);
