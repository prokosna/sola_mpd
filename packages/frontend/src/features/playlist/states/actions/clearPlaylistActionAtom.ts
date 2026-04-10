import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd";
import { currentMpdProfileAtom } from "../../../profile";
import { buildClearPlaylistCommands } from "../../functions/playlistSongOperations";

export const clearPlaylistActionAtom = atom(
	null,
	async (get, _set, playlistName: string) => {
		const mpdClient = get(mpdClientAtom);
		const profile = get(currentMpdProfileAtom);
		if (mpdClient === undefined || profile === undefined) {
			return;
		}
		const commands = buildClearPlaylistCommands(playlistName, profile);
		await mpdClient.commandBulk(commands);
	},
);
