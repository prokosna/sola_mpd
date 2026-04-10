import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd";
import { currentMpdProfileAtom } from "../../../profile";
import { addSongAndPlay } from "../../functions/songTableCommand";

export const addSongAndPlayActionAtom = atom(
	null,
	async (get, _set, song: Song) => {
		const mpdClient = get(mpdClientAtom);
		const profile = get(currentMpdProfileAtom);
		if (mpdClient === undefined || profile === undefined) {
			return;
		}
		await addSongAndPlay(song, mpdClient, profile);
	},
);
