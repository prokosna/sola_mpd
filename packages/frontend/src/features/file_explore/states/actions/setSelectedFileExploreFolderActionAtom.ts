import type { Folder } from "@sola_mpd/shared/src/models/file_explore_pb.js";
import { atom } from "jotai";

import { selectedFileExploreFolderAtom } from "../atoms/fileExploreFoldersAtom";

export const setSelectedFileExploreFolderActionAtom = atom(
	null,
	(_get, set, folder: Folder) => {
		set(selectedFileExploreFolderAtom, folder);
	},
);
