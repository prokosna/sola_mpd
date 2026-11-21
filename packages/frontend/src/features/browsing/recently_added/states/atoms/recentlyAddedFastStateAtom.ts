import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";

import {
	type ProfileScopedState,
	selectProfileScopedState,
} from "../../../../common/functions/profileScopedState";
import { currentMpdProfileAtom } from "../../../../profile/states/atoms/mpdProfileAtom";

export type RecentlyAddedFastState = {
	songs: Song[];
	daysVisible: number;
	isLoading: boolean;
	hasMore: boolean;
	error?: string;
};

export const initialRecentlyAddedFastState: RecentlyAddedFastState = {
	songs: [],
	daysVisible: 0,
	isLoading: false,
	hasMore: true,
};

export const storedRecentlyAddedFastStateAtom = atom<
	ProfileScopedState<RecentlyAddedFastState> | undefined
>(undefined);

export const recentlyAddedFastStateAtom = atom((get) =>
	selectProfileScopedState(
		get(storedRecentlyAddedFastStateAtom),
		get(currentMpdProfileAtom)?.name,
		initialRecentlyAddedFastState,
	),
);
