import { MpdEvent_EventType } from "@sola_mpd/shared/src/models/mpd/mpd_event_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

import { refreshPlayQueueSongsActionAtom } from "../../play_queue";
import {
	refreshCurrentSongActionAtom,
	refreshPlayerStatusActionAtom,
	refreshPlayerVolumeActionAtom,
} from "../../player";
import {
	refreshPlaylistSongsActionAtom,
	refreshPlaylistsActionAtom,
} from "../../playlist";
import { currentMpdProfileAtom } from "../../profile";
import { refreshStatsActionAtom } from "../../stats";
import { mpdListenerAtom } from "../states/atoms/mpdListenerAtom";

export function MpdEventObserver() {
	const mpdListener = useAtomValue(mpdListenerAtom);
	const profile = useAtomValue(currentMpdProfileAtom);
	const refreshStats = useSetAtom(refreshStatsActionAtom);
	const refreshPlayQueueSongs = useSetAtom(refreshPlayQueueSongsActionAtom);
	const refreshPlaylists = useSetAtom(refreshPlaylistsActionAtom);
	const refreshPlaylistSongs = useSetAtom(refreshPlaylistSongsActionAtom);
	const refreshPlayerVolume = useSetAtom(refreshPlayerVolumeActionAtom);
	const refreshCurrentSong = useSetAtom(refreshCurrentSongActionAtom);
	const refreshPlayerStatus = useSetAtom(refreshPlayerStatusActionAtom);

	useEffect(() => {
		if (profile === undefined) {
			return;
		}

		mpdListener.on(MpdEvent_EventType.DATABASE, () => {
			refreshStats();
		});
		mpdListener.on(MpdEvent_EventType.UPDATE, () => {
			refreshStats();
			// The database-updating flag lives in the player status.
			refreshPlayerStatus();
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
		mpdListener.on(MpdEvent_EventType.OPTIONS, () => {
			refreshCurrentSong();
			refreshPlayerStatus();
		});
		mpdListener.on(MpdEvent_EventType.PLAYER, () => {
			refreshCurrentSong();
			refreshPlayerStatus();
		});
		mpdListener.on(MpdEvent_EventType.DISCONNECTED, () => {});
		mpdListener.onSubscribed(() => {
			refreshCurrentSong();
			refreshPlayerStatus();
		});
		mpdListener.subscribe(profile);

		return () => {
			mpdListener.unsubscribe(profile);
		};
	}, [
		mpdListener,
		profile,
		refreshCurrentSong,
		refreshPlayQueueSongs,
		refreshPlayerStatus,
		refreshPlayerVolume,
		refreshPlaylistSongs,
		refreshPlaylists,
		refreshStats,
	]);

	return null;
}
