import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd";
import { currentMpdProfileAtom } from "../../../profile";
import { buildRepeatCommand } from "../../functions/playerCommand";
import { playerStatusIsRepeatAtom } from "../atoms/playerStatusAtom";

export const toggleRepeatActionAtom = atom(null, (get, _set) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);
	if (mpdClient === undefined || profile === undefined) {
		return;
	}
	mpdClient.command(
		buildRepeatCommand(profile, !get(playerStatusIsRepeatAtom)),
	);
});
