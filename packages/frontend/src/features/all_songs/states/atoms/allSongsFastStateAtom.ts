import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";
import { atomEffect } from "jotai-effect";

import { currentMpdProfileAtom } from "../../../profile/states/atoms/mpdProfileAtom";

export type AllSongsFastState = {
	songs: Song[];
	offset: number;
	isLoading: boolean;
	hasMore: boolean;
};

export const initialAllSongsFastState: AllSongsFastState = {
	songs: [],
	offset: 0,
	isLoading: false,
	hasMore: true,
};

export const allSongsFastStateAtom = atom<AllSongsFastState>(
	initialAllSongsFastState,
);

// Tracks the profile name we last reacted to. The sentinel `initialized: false`
// distinguishes a fresh subscription (e.g. revisiting the page with cached
// data) from an actual profile change, which is what should clear the
// accumulator.
const lastSeenProfileNameAtom = atom<{ initialized: boolean; name?: string }>({
	initialized: false,
});

export const syncAllSongsFastStateEffectAtom = atomEffect((get, set) => {
	const profileName = get(currentMpdProfileAtom)?.name;
	const lastSeen = get(lastSeenProfileNameAtom);

	if (!lastSeen.initialized) {
		set(lastSeenProfileNameAtom, { initialized: true, name: profileName });
		return;
	}
	if (lastSeen.name === profileName) {
		return;
	}

	set(lastSeenProfileNameAtom, { initialized: true, name: profileName });
	set(allSongsFastStateAtom, initialAllSongsFastState);
});
