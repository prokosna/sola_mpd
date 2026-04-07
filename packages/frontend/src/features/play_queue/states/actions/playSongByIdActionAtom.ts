import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd";
import { currentMpdProfileAtom } from "../../../profile";
import { buildPlaySongByIdCommand } from "../../functions/playQueueSongOperations";

export const playSongByIdActionAtom = atom(
	null,
	async (get, _set, song: Song) => {
		const mpdClient = get(mpdClientAtom);
		const profile = get(currentMpdProfileAtom);
		if (mpdClient === undefined || profile === undefined) {
			return;
		}
		const command = buildPlaySongByIdCommand(song, profile);
		await mpdClient.command(command);
	},
);
