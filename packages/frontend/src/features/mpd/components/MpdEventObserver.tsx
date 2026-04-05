import { MpdEvent_EventType } from "@sola_mpd/shared/src/models/mpd/mpd_event_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

import { refreshPlayQueueSongsActionAtom } from "../../play_queue";
import { refreshPlayerVolumeActionAtom } from "../../player";
import {
	refreshPlaylistSongsActionAtom,
	refreshPlaylistsActionAtom,
} from "../../playlist";
import { currentMpdProfileAtom } from "../../profile";
import { refreshStatsActionAtom } from "../../stats";
import { mpdListenerAtom } from "../states/atoms/mpdListenerAtom";

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
	const mpdListener = useAtomValue(mpdListenerAtom);
	const profile = useAtomValue(currentMpdProfileAtom);
	const refreshStats = useSetAtom(refreshStatsActionAtom);
	const refreshPlayQueueSongs = useSetAtom(refreshPlayQueueSongsActionAtom);
	const refreshPlaylists = useSetAtom(refreshPlaylistsActionAtom);
	const refreshPlaylistSongs = useSetAtom(refreshPlaylistSongsActionAtom);
	const refreshPlayerVolume = useSetAtom(refreshPlayerVolumeActionAtom);

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
