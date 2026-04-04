import { atom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import { mpdClientAtom } from "../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileSyncAtom as currentMpdProfileAtom } from "../../../profile/states/mpdProfileState";
import { fetchPlayerStatus } from "../../utils/playerUtils";

export const playerStatusAsyncAtom = atomWithRefresh(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);

	if (profile === undefined) {
		return undefined;
	}

	return await fetchPlayerStatus(mpdClient, profile);
});

const playerStatusSourceAtom = atomWithSync(playerStatusAsyncAtom);

export const playerStatusPlaybackStateAtom = atom((get) => {
	return get(playerStatusSourceAtom)?.playbackState;
});

export const playerStatusIsConsumeAtom = atom((get) => {
	return get(playerStatusSourceAtom)?.isConsume;
});

export const playerStatusIsRandomAtom = atom((get) => {
	return get(playerStatusSourceAtom)?.isRandom;
});

export const playerStatusIsRepeatAtom = atom((get) => {
	return get(playerStatusSourceAtom)?.isRepeat;
});

export const playerStatusIsSingleAtom = atom((get) => {
	return get(playerStatusSourceAtom)?.isSingle;
});

export const playerStatusIsDatabaseUpdatingAtom = atom((get) => {
	return get(playerStatusSourceAtom)?.isDatabaseUpdating;
});

export const playerStatusElapsedAtom = atom((get) => {
	return get(playerStatusSourceAtom)?.elapsed;
});

export const playerStatusDurationAtom = atom((get) => {
	return get(playerStatusSourceAtom)?.duration;
});
