import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd";
import { currentMpdProfileAtom } from "../../../profile";
import { buildDeletePlaylistCommand } from "../../functions/playlistSongOperations";

export const deletePlaylistActionAtom = atom(
	null,
	async (get, _set, playlistName: string) => {
		const mpdClient = get(mpdClientAtom);
		const profile = get(currentMpdProfileAtom);
		if (mpdClient === undefined || profile === undefined) {
			return;
		}
		const command = buildDeletePlaylistCommand(playlistName, profile);
		await mpdClient.command(command);
	},
);
