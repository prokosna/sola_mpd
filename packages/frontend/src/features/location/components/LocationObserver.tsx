import { useEffect } from "react";
import { useLocation } from "react-router";

import {
	ROUTE_HOME_PLAYLIST,
	ROUTE_HOME_PLAY_QUEUE,
} from "../../../const/routes";
import { useRefreshPlayQueueSongsState } from "../../play_queue";
import { useRefreshPlaylistsState } from "../../playlist";
import { useSetSelectedSongsState } from "../../song_table";
import { useSetPathname, useTransitionCounter } from "../states/locationState";

/**
 * Manages global side effects triggered by route changes.
 *
 * Coordinates state updates when navigation occurs, including pathname
 * updates, song selection resets, and data refreshes for specific routes
 * like playlists and play queue.
 *
 * Should be mounted near the root of the application to ensure proper
 * route change handling across all components.
 *
 * @returns null - No UI rendered
 */
export function LocationObserver() {
	const location = useLocation();
	const transitionCounter = useTransitionCounter();

	const setPathname = useSetPathname();
	const setSelectedSongs = useSetSelectedSongsState();
	const refreshPlaylistsState = useRefreshPlaylistsState();
	const refreshPlayQueueSongsState = useRefreshPlayQueueSongsState();

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
