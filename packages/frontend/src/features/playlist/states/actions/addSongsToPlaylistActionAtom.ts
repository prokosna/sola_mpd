import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd";
import { currentMpdProfileAtom } from "../../../profile";
import { buildAddSongsToPlaylistCommands } from "../../functions/playlistSongOperations";

export const addSongsToPlaylistActionAtom = atom(
	null,
	async (get, _set, params: { songs: Song[]; playlistName: string }) => {
		const mpdClient = get(mpdClientAtom);
		const profile = get(currentMpdProfileAtom);
		if (mpdClient === undefined || profile === undefined) {
			return;
		}
		const commands = buildAddSongsToPlaylistCommands(
			params.songs,
			params.playlistName,
			profile,
		);
		if (commands.length === 0) {
			return;
		}
		await mpdClient.commandBulk(commands);
	},
);
