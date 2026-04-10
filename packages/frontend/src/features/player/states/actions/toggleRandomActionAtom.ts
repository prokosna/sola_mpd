import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd";
import { currentMpdProfileAtom } from "../../../profile";
import { buildRandomCommand } from "../../functions/playerCommand";
import { playerStatusIsRandomAtom } from "../atoms/playerStatusAtom";

export const toggleRandomActionAtom = atom(null, (get, _set) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);
	if (mpdClient === undefined || profile === undefined) {
		return;
	}
	mpdClient.command(
		buildRandomCommand(profile, !get(playerStatusIsRandomAtom)),
	);
});
