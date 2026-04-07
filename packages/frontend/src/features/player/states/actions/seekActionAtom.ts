import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd";
import { currentMpdProfileAtom } from "../../../profile";
import { buildSeekCommand } from "../../functions/playerCommand";
import { playerStatusDurationAtom } from "../atoms/playerStatusAtom";

export const seekActionAtom = atom(null, (get, _set, percentage: number) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);
	if (mpdClient === undefined || profile === undefined) {
		return;
	}
	if (percentage < 0 || percentage > 100) {
		return;
	}
	const duration = get(playerStatusDurationAtom);
	if (duration === undefined) {
		return;
	}
	const seekTo = (percentage / 100) * duration;
	mpdClient.command(buildSeekCommand(profile, seekTo));
});
