import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd";
import { currentMpdProfileAtom } from "../../../profile";
import { buildReorderPlaylistCommands } from "../../functions/playlistSongOperations";

export const reorderPlaylistActionAtom = atom(
	null,
	async (get, _set, params: { orderedSongs: Song[]; playlistName: string }) => {
		const mpdClient = get(mpdClientAtom);
		const profile = get(currentMpdProfileAtom);
		if (mpdClient === undefined || profile === undefined) {
			return;
		}
		const commands = buildReorderPlaylistCommands(
			params.orderedSongs,
			params.playlistName,
			profile,
		);
		await mpdClient.commandBulk(commands);
	},
);
