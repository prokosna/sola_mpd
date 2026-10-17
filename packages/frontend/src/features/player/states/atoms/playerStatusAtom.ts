import { atom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import { mpdClientAtom } from "../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileAtom } from "../../../profile/states/atoms/mpdProfileAtom";
import {
	interpolateElapsed,
	isPlaybackAdvancing,
	type PlayerStatusSnapshot,
} from "../../functions/playerElapsed";
import { fetchPlayerStatus } from "../../functions/playerFetching";
import { playerClockAtom } from "./playerClockAtom";

export const playerStatusAsyncAtom = atomWithRefresh<
	Promise<PlayerStatusSnapshot | undefined>
>(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);

	if (profile === undefined) {
		return undefined;
	}

	const status = await fetchPlayerStatus(mpdClient, profile);
	if (status === undefined) {
		return undefined;
	}
	return { status, receivedAt: performance.now() };
});

const playerStatusSnapshotAtom = atomWithSync(playerStatusAsyncAtom);

const playerStatusAtom = atom((get) => {
	return get(playerStatusSnapshotAtom)?.status;
});

export const playerStatusPlaybackStateAtom = atom((get) => {
	return get(playerStatusAtom)?.playbackState;
});

export const playerStatusIsPlayingAtom = atom((get) => {
	return isPlaybackAdvancing(get(playerStatusAtom)?.playbackState);
});

export const playerStatusIsConsumeAtom = atom((get) => {
	return get(playerStatusAtom)?.isConsume;
});

export const playerStatusIsRandomAtom = atom((get) => {
	return get(playerStatusAtom)?.isRandom;
});

export const playerStatusIsRepeatAtom = atom((get) => {
	return get(playerStatusAtom)?.isRepeat;
});

export const playerStatusIsSingleAtom = atom((get) => {
	return get(playerStatusAtom)?.isSingle;
});

export const playerStatusIsDatabaseUpdatingAtom = atom((get) => {
	return get(playerStatusAtom)?.isDatabaseUpdating;
});

export const playerStatusElapsedAtom = atom((get) => {
	return interpolateElapsed(
		get(playerStatusSnapshotAtom),
		get(playerClockAtom),
	);
});

export const playerStatusDurationAtom = atom((get) => {
	return get(playerStatusAtom)?.duration;
});
