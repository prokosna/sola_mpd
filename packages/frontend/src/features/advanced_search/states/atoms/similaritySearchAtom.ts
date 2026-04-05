import { AdvancedSearchCommand_SimilarityType } from "@sola_mpd/shared/src/models/advanced_search_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";
import { atomWithRefresh, atomWithStorage } from "jotai/utils";

import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import { currentMpdProfileAtom } from "../../../profile/states/atoms/mpdProfileAtom";
import { searchSimilarSongs } from "../../utils/similaritySearchUtils";
import {
	advancedSearchEndpointAtom,
	advancedSearchQueryLimitAtom,
} from "./advancedSearchAtom";
import { advancedSearchClientAtom } from "./advancedSearchClientAtom";

export const similaritySearchTargetSongAtom = atom<Song | undefined>(undefined);

export const similaritySearchTypeAtom =
	atomWithStorage<AdvancedSearchCommand_SimilarityType>(
		"similaritySearchType",
		AdvancedSearchCommand_SimilarityType.MUQ,
		undefined,
		{ getOnInit: true },
	);

export const similaritySearchSongsAsyncAtom = atomWithRefresh(async (get) => {
	const targetSong = get(similaritySearchTargetSongAtom);
	const profile = get(currentMpdProfileAtom);
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
