import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd";
import { currentMpdProfileAtom } from "../../../profile";
import { buildStopCommand } from "../../functions/playerCommand";

export const stopActionAtom = atom(null, (get, _set) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);
	if (mpdClient === undefined || profile === undefined) {
		return;
	}
	mpdClient.command(buildStopCommand(profile));
});
