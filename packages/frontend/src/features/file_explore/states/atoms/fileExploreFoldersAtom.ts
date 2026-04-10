import type { Folder } from "@sola_mpd/shared/src/models/file_explore_pb.js";
import { atom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import { mpdClientAtom } from "../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileAtom } from "../../../profile/states/atoms/mpdProfileAtom";
import { fetchFileExploreFolders } from "../../functions/fileExploreFetching";

export const fileExploreFoldersAsyncAtom = atomWithRefresh(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);

	if (profile === undefined) {
		return [];
	}

	return await fetchFileExploreFolders(mpdClient, profile);
});

export const fileExploreFoldersAtom = atomWithSync(fileExploreFoldersAsyncAtom);

export const selectedFileExploreFolderAtom = atom<Folder | undefined>(
	undefined,
);
