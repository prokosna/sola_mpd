import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { useLocation } from "react-router";

import {
	ROUTE_HOME_PLAY_QUEUE,
	ROUTE_HOME_PLAYLIST,
} from "../../../const/routes";
import { refreshPlayQueueSongsActionAtom } from "../../play_queue";
import { refreshPlaylistsActionAtom } from "../../playlist";
import { selectedSongsAtom } from "../../song_table";
import { setPathnameActionAtom } from "../states/actions/setPathnameActionAtom";
import { transitionCounterAtom } from "../states/atoms/locationAtom";

export function LocationObserver() {
	const location = useLocation();
	const transitionCounter = useAtomValue(transitionCounterAtom);

	const setPathname = useSetAtom(setPathnameActionAtom);
	const setSelectedSongs = useSetAtom(selectedSongsAtom);
	const refreshPlaylistsState = useSetAtom(refreshPlaylistsActionAtom);
	const refreshPlayQueueSongsState = useSetAtom(
		refreshPlayQueueSongsActionAtom,
	);

	useEffect(() => {
		setPathname(location.pathname);
		// When user moves to a different page, selected songs should be reset.
		setSelectedSongs([]);
	}, [location.pathname, setPathname, setSelectedSongs]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Transition counter is used to detect page transitions even without actual page transitions.
	useEffect(() => {
		if (location.pathname === ROUTE_HOME_PLAYLIST) {
			refreshPlaylistsState();
		}

		if (location.pathname === ROUTE_HOME_PLAY_QUEUE) {
			refreshPlayQueueSongsState();
		}
	}, [
		location.pathname,
		transitionCounter,
		refreshPlayQueueSongsState,
		refreshPlaylistsState,
	]);

	return null;
}
