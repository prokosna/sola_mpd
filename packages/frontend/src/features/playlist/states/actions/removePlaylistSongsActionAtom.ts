import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd";
import { currentMpdProfileAtom } from "../../../profile";
import type { SongTableKeyType } from "../../../song_table";
import { buildRemovePlaylistSongsCommands } from "../../functions/playlistSongOperations";

export const removePlaylistSongsActionAtom = atom(
	null,
	async (
		get,
		_set,
		params: {
			targetSongs: Song[];
			allSongs: Song[];
			playlistName: string;
			songTableKeyType: SongTableKeyType;
		},
	) => {
		const mpdClient = get(mpdClientAtom);
		const profile = get(currentMpdProfileAtom);
		if (mpdClient === undefined || profile === undefined) {
			return;
		}
		const commands = buildRemovePlaylistSongsCommands(
			params.targetSongs,
			params.allSongs,
			params.playlistName,
			profile,
			params.songTableKeyType,
		);
		await mpdClient.commandBulk(commands);
	},
);
