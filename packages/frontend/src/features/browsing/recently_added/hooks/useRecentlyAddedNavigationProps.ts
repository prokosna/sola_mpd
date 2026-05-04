import type { BrowserFilter } from "@sola_mpd/shared/src/models/browser_pb.js";
import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";

import type { UpdateMode } from "../../../../types/stateTypes";
import { mpdCapabilitiesAtom } from "../../../mpd/states/atoms/mpdCapabilitiesAtom";
import { loadMoreRecentlyAddedFastStateActionAtom } from "../states/actions/loadMoreRecentlyAddedFastStateActionAtom";
import { updateRecentlyAddedBrowserFiltersActionAtom } from "../states/actions/updateRecentlyAddedBrowserFiltersActionAtom";
import {
	recentlyAddedFastStateAtom,
	syncRecentlyAddedFastStateEffectAtom,
} from "../states/atoms/recentlyAddedFastStateAtom";
import {
	filteredRecentlyAddedBrowserFilterValuesMapAtom,
	recentlyAddedBrowserFiltersAtom,
} from "../states/atoms/recentlyAddedFiltersAtom";

type RecentlyAddedNavigationProps = {
	browserFilters?: BrowserFilter[];
	browserFilterValues?: Map<Song_MetadataTag, string[]>;
	updateBrowserFilters: (
		browserFilters: BrowserFilter[],
		mode: UpdateMode,
	) => Promise<void>;
	onScrolledNearBottom?: () => void;
};

export function useRecentlyAddedNavigationProps(): RecentlyAddedNavigationProps {
	// Mount the profile-switch reset effect for the fast accumulator.
	useAtom(syncRecentlyAddedFastStateEffectAtom);

	const browserFilters = useAtomValue(recentlyAddedBrowserFiltersAtom);
	const browserFilterValues = useAtomValue(
		filteredRecentlyAddedBrowserFilterValuesMapAtom,
	);
	const updateFiltersAction = useSetAtom(
		updateRecentlyAddedBrowserFiltersActionAtom,
	);
	const capabilities = useAtomValue(mpdCapabilitiesAtom);
	const fastState = useAtomValue(recentlyAddedFastStateAtom);
	const loadMore = useSetAtom(loadMoreRecentlyAddedFastStateActionAtom);

	// Kick off the initial load when entering the page on a capable server.
	const isFast = capabilities.supportsAddedSince;
	const fastEmpty = fastState.songs.length === 0;
	const fastIdle = !fastState.isLoading && fastState.hasMore;
	useEffect(() => {
		if (isFast && fastEmpty && fastIdle) {
			loadMore();
		}
	}, [isFast, fastEmpty, fastIdle, loadMore]);

	const updateBrowserFilters = useCallback(
		async (filters: BrowserFilter[], _mode: UpdateMode) => {
			await updateFiltersAction(filters);
		},
		[updateFiltersAction],
	);

	const onScrolledNearBottom = useCallback(() => {
		loadMore();
	}, [loadMore]);

	return {
		browserFilters,
		browserFilterValues,
		updateBrowserFilters,
		onScrolledNearBottom: isFast ? onScrolledNearBottom : undefined,
	};
}
