import { atom } from "jotai";

import { fileExploreFoldersAsyncAtom } from "../atoms/fileExploreFoldersAtom";

export const refreshFileExploreFoldersActionAtom = atom(null, (_get, set) => {
	set(fileExploreFoldersAsyncAtom);
});
