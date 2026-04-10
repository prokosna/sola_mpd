import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd";
import { currentMpdProfileAtom } from "../../../profile";
import { addSongsToQueue } from "../../functions/songTableCommand";

export const addSongsToQueueActionAtom = atom(
	null,
	async (get, _set, songs: Song[]) => {
		const mpdClient = get(mpdClientAtom);
		const profile = get(currentMpdProfileAtom);
		if (mpdClient === undefined || profile === undefined) {
			return;
		}
		await addSongsToQueue(mpdClient, songs, profile);
	},
);
