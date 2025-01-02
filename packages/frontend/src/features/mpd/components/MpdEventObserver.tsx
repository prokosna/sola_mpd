import { MpdEvent_EventType } from "@sola_mpd/domain/src/models/mpd/mpd_event_pb.js";
import { useEffect } from "react";

import { useRefreshPlayQueueSongsState } from "../../play_queue";
import { useRefreshPlayerVolumeState } from "../../player";
import {
	useRefreshPlaylistSongsState,
	useRefreshPlaylistsState,
} from "../../playlist";
import { useCurrentMpdProfileState } from "../../profile";
import { useRefreshStatsState } from "../../stats";
import { useMpdListenerState } from "../states/mpdListener";

/**
 * Manages MPD event handling and corresponding state updates.
 *
 * Subscribes to MPD events based on the current profile and updates
 * application state accordingly. Handles events for database updates,
 * playlist changes, queue modifications, volume changes, and connection
 * status. Automatically manages event subscriptions lifecycle.
 *
 * Should be mounted near the root to ensure proper event handling
 * across the application.
 *
 * @returns null - No UI rendered
 */
export function MpdEventObserver() {
	const mpdListener = useMpdListenerState();
	const profile = useCurrentMpdProfileState();
	const refreshStats = useRefreshStatsState();
	const refreshPlayQueueSongs = useRefreshPlayQueueSongsState();
	const refreshPlaylists = useRefreshPlaylistsState();
	const refreshPlaylistSongs = useRefreshPlaylistSongsState();
	const refreshPlayerVolume = useRefreshPlayerVolumeState();

	useEffect(() => {
		if (profile === undefined) {
			return;
		}

		mpdListener.on(MpdEvent_EventType.DATABASE, () => {
			refreshStats();
		});
		mpdListener.on(MpdEvent_EventType.UPDATE, () => {
			refreshStats();
		});
		mpdListener.on(MpdEvent_EventType.PLAYLIST, () => {
			refreshPlaylists();
			refreshPlaylistSongs();
		});
		mpdListener.on(MpdEvent_EventType.PLAY_QUEUE, () => {
			refreshPlayQueueSongs();
		});
		mpdListener.on(MpdEvent_EventType.MIXER, () => {
			refreshPlayerVolume();
		});
		mpdListener.on(MpdEvent_EventType.OPTIONS, () => {});
		mpdListener.on(MpdEvent_EventType.PLAYER, () => {});
		mpdListener.on(MpdEvent_EventType.DISCONNECTED, () => {});
		mpdListener.subscribe(profile);

		return () => {
			mpdListener.unsubscribe(profile);
		};
	}, [
		mpdListener,
		profile,
		refreshPlayQueueSongs,
		refreshPlayerVolume,
		refreshPlaylistSongs,
		refreshPlaylists,
		refreshStats,
	]);

	return null;
}
