import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd";
import { currentMpdProfileAtom } from "../../../profile";
import { buildTogglePlaybackCommand } from "../../functions/playerCommand";
import { playerStatusPlaybackStateAtom } from "../atoms/playerStatusAtom";

export const togglePauseActionAtom = atom(null, (get, _set) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);
	if (mpdClient === undefined || profile === undefined) {
		return;
	}
	mpdClient.command(
		buildTogglePlaybackCommand(profile, get(playerStatusPlaybackStateAtom)),
	);
});
