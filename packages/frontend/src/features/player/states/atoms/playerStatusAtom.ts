import { atom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import { mpdClientAtom } from "../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileAtom } from "../../../profile/states/atoms/mpdProfileAtom";
import { fetchPlayerStatus } from "../../functions/playerFetching";

export const playerStatusAsyncAtom = atomWithRefresh(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);

	if (profile === undefined) {
		return undefined;
	}

	return await fetchPlayerStatus(mpdClient, profile);
});

const playerStatusAtom = atomWithSync(playerStatusAsyncAtom);

export const playerStatusPlaybackStateAtom = atom((get) => {
	return get(playerStatusAtom)?.playbackState;
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
	return get(playerStatusAtom)?.elapsed;
});

export const playerStatusDurationAtom = atom((get) => {
	return get(playerStatusAtom)?.duration;
});
