import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { useSetAtom } from "jotai";
import { useCallback } from "react";

import { addSongAndPlayActionAtom } from "../states/actions/addSongAndPlayActionAtom";

export function useHandleSongDoubleClick() {
	const addSongAndPlay = useSetAtom(addSongAndPlayActionAtom);

	return useCallback(
		async (clickedSong: Song) => {
			await addSongAndPlay(clickedSong);
		},
		[addSongAndPlay],
	);
}
