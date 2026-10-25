import { AdvancedSearchCommand_SimilarityType } from "@sola_mpd/shared/src/models/advanced_search_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";
import { atomWithRefresh, atomWithStorage } from "jotai/utils";

import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import {
	buildDeviceSettingKey,
	DEVICE_SETTING_KEY_SIMILARITY_SEARCH_TYPE,
} from "../../../common";
import { currentMpdProfileAtom } from "../../../profile/states/atoms/mpdProfileAtom";
import {
	type SimilaritySearchResult,
	searchSimilarSongs,
} from "../../functions/similaritySearch";
import {
	advancedSearchEndpointAtom,
	advancedSearchQueryLimitAtom,
} from "./advancedSearchAtom";
import { advancedSearchClientAtom } from "./advancedSearchClientAtom";

export const similaritySearchTargetSongAtom = atom<Song | undefined>(undefined);

export const similaritySearchTypeAtom =
	atomWithStorage<AdvancedSearchCommand_SimilarityType>(
		buildDeviceSettingKey(DEVICE_SETTING_KEY_SIMILARITY_SEARCH_TYPE),
		AdvancedSearchCommand_SimilarityType.MUQ,
		undefined,
		{ getOnInit: true },
	);

export const similaritySearchSongsAsyncAtom = atomWithRefresh(
	async (get): Promise<SimilaritySearchResult> => {
		try {
			const targetSong = get(similaritySearchTargetSongAtom);
			const profile = get(currentMpdProfileAtom);
			const client = get(advancedSearchClientAtom);
			const endpoint = get(advancedSearchEndpointAtom);
			const limit = get(advancedSearchQueryLimitAtom);
			const similarityType = get(similaritySearchTypeAtom);

			if (
				profile === undefined ||
				endpoint === undefined ||
				targetSong === undefined
			) {
				return { kind: "songs", songs: [] };
			}

			return await searchSimilarSongs(
				profile,
				endpoint,
				client,
				targetSong,
				limit,
				similarityType,
			);
		} catch (err) {
			return {
				kind: "error",
				message: err instanceof Error ? err.message : String(err),
			};
		}
	},
);

export const similaritySearchSongsAtom = atomWithSync(
	similaritySearchSongsAsyncAtom,
);
