import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { useCallback } from "react";

import type { MpdClient } from "../../mpd";
import { addSongAndPlay } from "../functions/songTableCommand";

export function useHandleSongDoubleClick(
	mpdClient?: MpdClient,
	mpdProfile?: MpdProfile,
) {
	return useCallback(
		async (clickedSong: Song) => {
			if (mpdProfile === undefined || mpdClient === undefined) {
				return;
			}
			await addSongAndPlay(clickedSong, mpdClient, mpdProfile);
		},
		[mpdClient, mpdProfile],
	);
}
