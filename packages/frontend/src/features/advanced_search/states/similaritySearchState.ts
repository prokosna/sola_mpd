import { AdvancedSearchCommand_SimilarityType } from "@sola_mpd/domain/src/models/advanced_search_pb.js";
import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh, atomWithStorage } from "jotai/utils";
import { useCallback } from "react";
import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { searchSimilarSongs } from "../utils/similaritySearchUtils";
import { advancedSearchClientAtom } from "./advancedSearchClient";
import {
	advancedSearchEndpointAtom,
	advancedSearchQueryLimitAtom,
} from "./advancedSearchState";

const similaritySearchTargetSongAtom = atom<Song | undefined>(undefined);

const similaritySearchTypeAtom =
	atomWithStorage<AdvancedSearchCommand_SimilarityType>(
		"similaritySearchType",
		AdvancedSearchCommand_SimilarityType.MUQ,
		undefined,
		{ getOnInit: true },
	);

const similaritySearchSongsAsyncAtom = atomWithRefresh(async (get) => {
	const targetSong = get(similaritySearchTargetSongAtom);
	const profile = get(currentMpdProfileSyncAtom);
	const client = get(advancedSearchClientAtom);
	const endpoint = get(advancedSearchEndpointAtom);
	const limit = get(advancedSearchQueryLimitAtom);
	const similarityType = get(similaritySearchTypeAtom);

	if (profile === undefined || endpoint === undefined) {
		return [];
	}
	if (targetSong === undefined) {
		return [];
	}

	return await searchSimilarSongs(
		profile,
		endpoint,
		client,
		targetSong,
		limit,
		similarityType,
	);
});

export const similaritySearchSongsAtom = atomWithSync(
	similaritySearchSongsAsyncAtom,
);

/**
 * Hook for accessing the similarity search target song state.
 *
 * @returns The current similarity search target song state
 */
export function useSimilaritySearchTargetSongState() {
	return useAtomValue(similaritySearchTargetSongAtom);
}

/**
 * Hook for updating the similarity search target song state.
 *
 * @returns Memoized target song update function
 */
export function useSetSimilaritySearchTargetSongState() {
	const setSimilaritySearchTargetSong = useSetAtom(
		similaritySearchTargetSongAtom,
	);
	return useCallback(
		async (song: Song | undefined) => {
			setSimilaritySearchTargetSong(song);
		},
		[setSimilaritySearchTargetSong],
	);
}

/**
 * Hook for accessing the similarity search type state.
 *
 * @returns The current similarity search type state
 */
export function useSimilaritySearchTypeState() {
	return useAtomValue(similaritySearchTypeAtom);
}

/**
 * Hook for updating the similarity search type state.
 *
 * @returns Memoized type update function
 */
export function useSetSimilaritySearchTypeState() {
	const setSimilaritySearchType = useSetAtom(similaritySearchTypeAtom);
	return useCallback(
		(type: AdvancedSearchCommand_SimilarityType) => {
			setSimilaritySearchType(type);
		},
		[setSimilaritySearchType],
	);
}

/**
 * Hook for accessing the similarity search songs state.
 *
 * @returns The current similarity search songs state
 */
export function useSimilaritySearchSongsState() {
	return useAtomValue(similaritySearchSongsAtom);
}

/**
 * Hook for refreshing the similarity search songs state.
 *
 * @returns Refresh function
 */
export function useRefreshSimilaritySearchSongsState() {
	const refresh = useSetAtom(similaritySearchSongsAsyncAtom);
	return useCallback(async () => {
		refresh();
	}, [refresh]);
}
