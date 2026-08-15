import type { Search } from "@sola_mpd/shared/src/models/search_pb.js";
import { atom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { ROUTE_HOME_SEARCH } from "../../../../const/routes";
import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import { filterSongsByGlobalFilter } from "../../../global_filter";
import { globalFilterTokensAtom } from "../../../global_filter/states/atoms/globalFilterAtom";
import { pathnameAtom } from "../../../location/states/atoms/locationAtom";
import { mpdCapabilitiesAtom } from "../../../mpd/states/atoms/mpdCapabilitiesAtom";
import { mpdClientAtom } from "../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileAtom } from "../../../profile/states/atoms/mpdProfileAtom";
import { fetchSearchSongs } from "../../functions/search";
import { searchColumnViewAtom } from "./searchColumnViewAtom";

export const targetSearchAtom = atom<Search | undefined>(undefined);

export const searchSongsAsyncAtom = atomWithRefresh(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);
	const search = get(targetSearchAtom);
	const capabilities = get(mpdCapabilitiesAtom);

	if (profile === undefined) {
		return undefined;
	}
	if (search === undefined) {
		return [];
	}

	return await fetchSearchSongs(
		mpdClient,
		profile,
		search,
		capabilities.isMpd024OrLater,
	);
});

const searchSongsAtom = atomWithSync(searchSongsAsyncAtom);

export const searchVisibleSongsAtom = atom((get) => {
	const searchSongs = get(searchSongsAtom);
	const searchColumns = get(searchColumnViewAtom);
	const globalFilterTokens = get(globalFilterTokensAtom);
	const pathname = get(pathnameAtom);

	if (
		pathname !== ROUTE_HOME_SEARCH ||
		searchSongs === undefined ||
		searchColumns === undefined
	) {
		return undefined;
	}

	return filterSongsByGlobalFilter(
		searchSongs,
		globalFilterTokens,
		searchColumns,
	);
});
