import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd";
import { currentMpdProfileAtom } from "../../../profile";
import { buildSetVolumeCommand } from "../../functions/playerCommand";

export const setVolumeActionAtom = atom(null, (get, _set, volume: number) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);
	if (mpdClient === undefined || profile === undefined) {
		return;
	}
	if (volume < 0 || volume > 100) {
		return;
	}
	mpdClient.command(buildSetVolumeCommand(profile, volume));
});
