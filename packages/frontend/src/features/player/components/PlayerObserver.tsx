import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

import {
	PLAYER_CLOCK_TICK_INTERVAL_MS,
	PLAYER_STATUS_RESYNC_INTERVAL_MS,
} from "../const/playerTiming";
import { refreshCurrentSongActionAtom } from "../states/actions/refreshCurrentSongActionAtom";
import { refreshPlayerStatusActionAtom } from "../states/actions/refreshPlayerStatusActionAtom";
import { tickPlayerClockActionAtom } from "../states/actions/tickPlayerClockActionAtom";
import { playerStatusIsPlayingAtom } from "../states/atoms/playerStatusAtom";

export function PlayerObserver() {
	const refreshCurrentSong = useSetAtom(refreshCurrentSongActionAtom);
	const refreshPlayerStatus = useSetAtom(refreshPlayerStatusActionAtom);
	const tickPlayerClock = useSetAtom(tickPlayerClockActionAtom);
	const isPlaying = useAtomValue(playerStatusIsPlayingAtom);

	useEffect(() => {
		const id = setInterval(() => {
			refreshCurrentSong();
			refreshPlayerStatus();
		}, PLAYER_STATUS_RESYNC_INTERVAL_MS);
		return () => {
			clearInterval(id);
		};
	}, [refreshCurrentSong, refreshPlayerStatus]);

	useEffect(() => {
		if (!isPlaying) {
			return;
		}
		tickPlayerClock();
		const id = setInterval(tickPlayerClock, PLAYER_CLOCK_TICK_INTERVAL_MS);
		return () => {
			clearInterval(id);
		};
	}, [isPlaying, tickPlayerClock]);

	return null;
}
