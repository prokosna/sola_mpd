import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd";
import { currentMpdProfileAtom } from "../../../profile";
import { buildPreviousCommand } from "../../functions/playerCommand";

export const previousActionAtom = atom(null, (get, _set) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);
	if (mpdClient === undefined || profile === undefined) {
		return;
	}
	mpdClient.command(buildPreviousCommand(profile));
});
