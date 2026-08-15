import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";

import { mpdCapabilitiesAtom } from "../../../mpd/states/atoms/mpdCapabilitiesAtom";
import type { BrowserFilterView } from "../../common/types/browserFilterView";
import { loadMoreRecentlyAddedFastStateActionAtom } from "../states/actions/loadMoreRecentlyAddedFastStateActionAtom";
import {
	recentlyAddedFastStateAtom,
	syncRecentlyAddedFastStateEffectAtom,
} from "../states/atoms/recentlyAddedFastStateAtom";
import {
	filteredRecentlyAddedFilterValuesMapAtom,
	recentlyAddedFiltersAtom,
} from "../states/atoms/recentlyAddedFiltersAtom";
import { useUpdateRecentlyAddedFilters } from "./useUpdateRecentlyAddedFilters";

type RecentlyAddedNavigationProps = {
	browserFilters?: BrowserFilterView[];
	browserFilterValues?: Map<Song_MetadataTag, string[]>;
	updateBrowserFilters: (browserFilters: BrowserFilterView[]) => Promise<void>;
	onScrolledNearBottom?: () => void;
};

export function useRecentlyAddedNavigationProps(): RecentlyAddedNavigationProps {
	// Mount the profile-switch reset effect for the fast accumulator.
	useAtom(syncRecentlyAddedFastStateEffectAtom);

	const browserFilters = useAtomValue(recentlyAddedFiltersAtom);
	const browserFilterValues = useAtomValue(
		filteredRecentlyAddedFilterValuesMapAtom,
	);
	const updateBrowserFilters = useUpdateRecentlyAddedFilters();
	const capabilities = useAtomValue(mpdCapabilitiesAtom);
	const fastState = useAtomValue(recentlyAddedFastStateAtom);
	const loadMore = useSetAtom(loadMoreRecentlyAddedFastStateActionAtom);

	// Kick off the initial load when entering the page on a capable server.
	const isFast = capabilities.isMpd024OrLater;
	const fastEmpty = fastState.songs.length === 0;
	const fastIdle = !fastState.isLoading && fastState.hasMore;
	useEffect(() => {
		if (isFast && fastEmpty && fastIdle) {
			loadMore();
		}
	}, [isFast, fastEmpty, fastIdle, loadMore]);

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
