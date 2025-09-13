import { AdvancedSearchCommand_TextToMusicType } from "@sola_mpd/domain/src/models/advanced_search_pb.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh, atomWithStorage } from "jotai/utils";
import { useCallback } from "react";
import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { searchSongsByText } from "../utils/textToMusicSearchUtils";
import { advancedSearchClientAtom } from "./advancedSearchClient";
import {
	advancedSearchEndpointAtom,
	advancedSearchQueryLimitAtom,
} from "./advancedSearchState";

const textToMusicSearchTextAtom = atom("");

const textToMusicTypeAtom =
	atomWithStorage<AdvancedSearchCommand_TextToMusicType>(
		"textToMusicType",
		AdvancedSearchCommand_TextToMusicType.MUQ_MULAN,
		undefined,
		{ getOnInit: true },
	);

/**
 * Normalized natural language search text.
 */
export const textToMusicSearchQueryAtom = atom((get) => {
	const text = get(textToMusicSearchTextAtom);

	const regex = /^[a-zA-Z0-9 ]*$/;
	if (!regex.test(text)) {
		return "";
	}

	const chunks = text.split(" ");
	const tokens = chunks.map((v) => v.trim()).filter((v) => v !== "");
	return tokens.join(" ");
});

const textToMusicSearchSongsAsyncAtom = atomWithRefresh(async (get) => {
	const query = get(textToMusicSearchQueryAtom);
	const profile = get(currentMpdProfileSyncAtom);
	const client = get(advancedSearchClientAtom);
	const endpoint = get(advancedSearchEndpointAtom);
	const limit = get(advancedSearchQueryLimitAtom);
	const textToMusicType = get(textToMusicTypeAtom);

	if (profile === undefined || endpoint === undefined) {
		return [];
	}
	if (query === "") {
		return [];
	}

	return await searchSongsByText(
		profile,
		endpoint,
		client,
		query,
		limit,
		textToMusicType,
	);
});

const textToMusicSearchSongsAtom = atomWithSync(
	textToMusicSearchSongsAsyncAtom,
);

/**
 * Hook for updating natural language search text.
 *
 * @returns Memoized text update function
 */
export function useSetTextToMusicSearchTextState() {
	const setTextToMusicSearchText = useSetAtom(textToMusicSearchTextAtom);
	return useCallback(
		(text: string) => {
			setTextToMusicSearchText(text);
		},
		[setTextToMusicSearchText],
	);
}

/**
 * Hook for accessing the natural language search songs state.
 *
 * @returns The current natural language search songs state
 */
export function useTextToMusicSearchSongsState() {
	return useAtomValue(textToMusicSearchSongsAtom);
}

/**
 * Hook for refreshing natural language search songs state.
 *
 * @returns Refresh function
 */
export function useRefreshTextToMusicSearchSongsState() {
	const refresh = useSetAtom(textToMusicSearchSongsAsyncAtom);
	return useCallback(() => {
		refresh();
	}, [refresh]);
}
