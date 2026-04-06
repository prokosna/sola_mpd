import type { Search } from "@sola_mpd/shared/src/models/search_pb.js";
import { atom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { ROUTE_HOME_SEARCH } from "../../../../const/routes";
import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import { filterSongsByGlobalFilter } from "../../../global_filter";
import { globalFilterTokensAtom } from "../../../global_filter/states/atoms/globalFilterAtom";
import { pathnameAtom } from "../../../location/states/atoms/locationAtom";
import { mpdClientAtom } from "../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileAtom } from "../../../profile/states/atoms/mpdProfileAtom";
import { fetchSearchSongs } from "../../functions/search";
import { searchSongTableColumnsAtom } from "./searchEditAtom";

export const targetSearchAtom = atom<Search | undefined>(undefined);

export const searchSongsAsyncAtom = atomWithRefresh(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);
	const search = get(targetSearchAtom);

	if (profile === undefined) {
		return undefined;
	}
	if (search === undefined) {
		return [];
	}

	return await fetchSearchSongs(mpdClient, profile, search);
});

const searchSongsAtom = atomWithSync(searchSongsAsyncAtom);

export const searchVisibleSongsAtom = atom((get) => {
	const searchSongs = get(searchSongsAtom);
	const searchSongTableColumns = get(searchSongTableColumnsAtom);
	const globalFilterTokens = get(globalFilterTokensAtom);
	const pathname = get(pathnameAtom);

	if (pathname !== ROUTE_HOME_SEARCH || searchSongs === undefined) {
		return undefined;
	}

	return filterSongsByGlobalFilter(
		searchSongs,
		globalFilterTokens,
		searchSongTableColumns,
	);
});
