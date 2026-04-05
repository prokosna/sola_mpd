import { atom } from "jotai";
import { RESET } from "jotai/utils";

import { pluginAsyncAtom } from "../atoms/pluginAtom";

export const refreshPluginActionAtom = atom(null, (_get, set) => {
	set(pluginAsyncAtom, RESET);
});
