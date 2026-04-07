import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd";
import { currentMpdProfileAtom } from "../../../profile";
import { buildDropDuplicatePlaylistSongsCommands } from "../../functions/playlistSongOperations";

export const dropDuplicatePlaylistSongsActionAtom = atom(
	null,
	async (
		get,
		_set,
		params: { sortedSongs: Song[]; playlistName: string },
	): Promise<number> => {
		const mpdClient = get(mpdClientAtom);
		const profile = get(currentMpdProfileAtom);
		if (mpdClient === undefined || profile === undefined) {
			return 0;
		}
		const { commands, duplicateCount } =
			buildDropDuplicatePlaylistSongsCommands(
				params.sortedSongs,
				params.playlistName,
				profile,
			);
		if (duplicateCount === 0) {
			return 0;
		}
		await mpdClient.commandBulk(commands);
		return duplicateCount;
	},
);
