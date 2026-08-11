import { atom } from "jotai";

import { loadPluginState, pluginAsyncAtom } from "../atoms/pluginAtom";

// Assigns a freshly fetched value: `set(xAsyncAtom, RESET)` is a no-op on an
// atomWithDefault the client has never locally written, so the refetch a
// peer's broadcast asks for would silently not happen.
export const refreshPluginActionAtom = atom(null, async (get, set) => {
	const state = await loadPluginState(get);
	set(pluginAsyncAtom, state);
});
