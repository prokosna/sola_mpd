import { atom } from "jotai";
import { atomEffect } from "jotai-effect";

import { selectedFileExploreFolderAtom } from "./fileExploreFoldersAtom";

export const isFileExploreLoadingAtom = atom(true);

export const syncFileExploreLoadingEffectAtom = atomEffect((get, set) => {
	get(selectedFileExploreFolderAtom);
	set(isFileExploreLoadingAtom, true);
});
