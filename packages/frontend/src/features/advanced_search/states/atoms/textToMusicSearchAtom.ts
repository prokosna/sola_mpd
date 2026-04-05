import { AdvancedSearchCommand_TextToMusicType } from "@sola_mpd/shared/src/models/advanced_search_pb.js";
import { atom } from "jotai";
import { atomWithRefresh, atomWithStorage } from "jotai/utils";

import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import { currentMpdProfileAtom } from "../../../profile/states/atoms/mpdProfileAtom";
import { searchSongsByText } from "../../utils/textToMusicSearchUtils";
import {
	advancedSearchEndpointAtom,
	advancedSearchQueryLimitAtom,
} from "./advancedSearchAtom";
import { advancedSearchClientAtom } from "./advancedSearchClientAtom";

export const textToMusicSearchTextAtom = atom("");

export const textToMusicTypeAtom =
	atomWithStorage<AdvancedSearchCommand_TextToMusicType>(
		"textToMusicType",
		AdvancedSearchCommand_TextToMusicType.MUQ_MULAN,
		undefined,
		{ getOnInit: true },
	);

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

export const textToMusicSearchSongsAsyncAtom = atomWithRefresh(async (get) => {
	const query = get(textToMusicSearchQueryAtom);
	const profile = get(currentMpdProfileAtom);
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

export const textToMusicSearchSongsAtom = atomWithSync(
	textToMusicSearchSongsAsyncAtom,
);
