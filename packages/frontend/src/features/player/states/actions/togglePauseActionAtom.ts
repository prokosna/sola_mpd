import { MpdPlayerStatus_PlaybackState } from "@sola_mpd/shared/src/models/mpd/mpd_player_pb.js";
import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd";
import { currentMpdProfileAtom } from "../../../profile";
import { buildPauseCommand } from "../../functions/playerCommand";
import { playerStatusPlaybackStateAtom } from "../atoms/playerStatusAtom";

export const togglePauseActionAtom = atom(null, (get, _set) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);
	if (mpdClient === undefined || profile === undefined) {
		return;
	}
	const pause =
		get(playerStatusPlaybackStateAtom) === MpdPlayerStatus_PlaybackState.PLAY;
	mpdClient.command(buildPauseCommand(profile, pause));
});
