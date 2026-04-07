import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd";
import { currentMpdProfileAtom } from "../../../profile";
import { replaceQueueWithSongs } from "../../functions/songTableCommand";

export const replaceQueueWithSongsActionAtom = atom(
	null,
	async (get, _set, songs: Song[]) => {
		const mpdClient = get(mpdClientAtom);
		const profile = get(currentMpdProfileAtom);
		if (mpdClient === undefined || profile === undefined) {
			return;
		}
		await replaceQueueWithSongs(mpdClient, songs, profile);
	},
);
