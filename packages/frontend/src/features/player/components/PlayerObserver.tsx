import { useSetAtom } from "jotai";
import { useEffect, useRef } from "react";

import { refreshCurrentSongActionAtom } from "../states/actions/refreshCurrentSongActionAtom";
import { refreshPlayerStatusActionAtom } from "../states/actions/refreshPlayerStatusActionAtom";

export function PlayerObserver() {
	const refreshCurrentSong = useSetAtom(refreshCurrentSongActionAtom);
	const refreshPlayerStatus = useSetAtom(refreshPlayerStatusActionAtom);

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
