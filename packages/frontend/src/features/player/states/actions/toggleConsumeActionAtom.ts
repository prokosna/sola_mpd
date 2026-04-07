import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd";
import { currentMpdProfileAtom } from "../../../profile";
import { buildConsumeCommand } from "../../functions/playerCommand";
import { playerStatusIsConsumeAtom } from "../atoms/playerStatusAtom";

export const toggleConsumeActionAtom = atom(null, (get, _set) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);
	if (mpdClient === undefined || profile === undefined) {
		return;
	}
	mpdClient.command(
		buildConsumeCommand(profile, !get(playerStatusIsConsumeAtom)),
	);
});
