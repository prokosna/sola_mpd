import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { atomWithRefresh, selectAtom } from "jotai/utils";

import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import { mpdClientAtom } from "../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileAtom } from "../../../profile/states/atoms/mpdProfileAtom";
import { fetchCurrentSong } from "../../utils/playerUtils";

export const currentSongAsyncAtom = atomWithRefresh(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);

	if (profile === undefined) {
		return undefined;
	}

	return await fetchCurrentSong(mpdClient, profile);
});

const currentSongBaseAtom = atomWithSync(currentSongAsyncAtom);

export const currentSongAtom = selectAtom<Song | undefined, Song | undefined>(
	currentSongBaseAtom,
	(state, _prev) => state,
	(a, b) => a?.path === b?.path,
);
