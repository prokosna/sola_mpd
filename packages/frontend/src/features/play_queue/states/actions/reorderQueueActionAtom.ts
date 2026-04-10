import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd";
import { currentMpdProfileAtom } from "../../../profile";
import { SongTableKeyType } from "../../../song_table";
import { buildReorderQueueCommands } from "../../functions/playQueueSongOperations";
import { playQueueVisibleSongsAtom } from "../atoms/playQueueSongsAtom";

export const reorderQueueActionAtom = atom(
	null,
	async (get, _set, orderedSongs: Song[]) => {
		const mpdClient = get(mpdClientAtom);
		const profile = get(currentMpdProfileAtom);
		const currentSongs = get(playQueueVisibleSongsAtom);
		if (
			mpdClient === undefined ||
			profile === undefined ||
			currentSongs === undefined
		) {
			return;
		}
		const commands = buildReorderQueueCommands(
			currentSongs,
			orderedSongs,
			SongTableKeyType.ID,
			profile,
		);
		await mpdClient.commandBulk(commands);
	},
);
