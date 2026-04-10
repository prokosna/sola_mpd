import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd";
import { currentMpdProfileAtom } from "../../../profile";
import { buildRemoveQueueSongsCommands } from "../../functions/playQueueSongOperations";

export const removeQueueSongsActionAtom = atom(
	null,
	async (get, _set, songs: Song[]) => {
		const mpdClient = get(mpdClientAtom);
		const profile = get(currentMpdProfileAtom);
		if (mpdClient === undefined || profile === undefined) {
			return;
		}
		const commands = buildRemoveQueueSongsCommands(songs, profile);
		await mpdClient.commandBulk(commands);
	},
);
