import { useEffect, useRef } from "react";

import { useRefreshCurrentSongState } from "../states/playerSongState";
import { useRefreshPlayerStatusState } from "../states/playerStatusState";

/**
 * Player state update manager.
 *
 * Polls MPD server every second to refresh current song and
 * player status. Uses interval-based polling with cleanup
 * on unmount to prevent memory leaks.
 *
 * @returns null - Non-rendering component
 */
export function PlayerObserver() {
	const refreshCurrentSong = useRefreshCurrentSongState();
	const refreshPlayerStatus = useRefreshPlayerStatusState();

	const intervalIdRef = useRef<ReturnType<typeof setInterval> | undefined>(
		undefined,
	);

	useEffect(() => {
		if (intervalIdRef.current === undefined) {
			const id = setInterval(() => {
				refreshCurrentSong();
				refreshPlayerStatus();
			}, 1000);
			intervalIdRef.current = id;
		}

		return () => {
			if (intervalIdRef.current !== undefined) {
				clearInterval(intervalIdRef.current);
				intervalIdRef.current = undefined;
			}
		};
	}, [refreshCurrentSong, refreshPlayerStatus]);

	return null;
}
