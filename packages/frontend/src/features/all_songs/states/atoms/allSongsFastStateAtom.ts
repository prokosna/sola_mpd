import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";

import {
	type ProfileScopedState,
	selectProfileScopedState,
} from "../../../common/functions/profileScopedState";
import { currentMpdProfileAtom } from "../../../profile/states/atoms/mpdProfileAtom";

export type AllSongsFastState = {
	songs: Song[];
	offset: number;
	isLoading: boolean;
	hasMore: boolean;
	error?: string;
};

export const initialAllSongsFastState: AllSongsFastState = {
	songs: [],
	offset: 0,
	isLoading: false,
	hasMore: true,
};

export const storedAllSongsFastStateAtom = atom<
	ProfileScopedState<AllSongsFastState> | undefined
>(undefined);

export const allSongsFastStateAtom = atom((get) =>
	selectProfileScopedState(
		get(storedAllSongsFastStateAtom),
		get(currentMpdProfileAtom)?.name,
		initialAllSongsFastState,
	),
);
