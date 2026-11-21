import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";

import { useNotification } from "../../../../lib/mantine/hooks/useNotification";
import { mpdCapabilitiesAtom } from "../../../mpd/states/atoms/mpdCapabilitiesAtom";
import type { BrowserFilterView } from "../../common/types/browserFilterView";
import { loadMoreRecentlyAddedFastStateActionAtom } from "../states/actions/loadMoreRecentlyAddedFastStateActionAtom";
import { recentlyAddedFastStateAtom } from "../states/atoms/recentlyAddedFastStateAtom";
import {
	filteredRecentlyAddedFilterValuesMapAtom,
	recentlyAddedFiltersAtom,
} from "../states/atoms/recentlyAddedFiltersAtom";
import { useUpdateRecentlyAddedFilters } from "./useUpdateRecentlyAddedFilters";

const SCROLL_RETRY_BACKOFF_MS = 5_000;

type RecentlyAddedNavigationProps = {
	browserFilters?: BrowserFilterView[];
	browserFilterValues?: Map<Song_MetadataTag, string[]>;
	updateBrowserFilters: (browserFilters: BrowserFilterView[]) => Promise<void>;
	onScrolledNearBottom?: () => void;
};

export function useRecentlyAddedNavigationProps(): RecentlyAddedNavigationProps {
	const browserFilters = useAtomValue(recentlyAddedFiltersAtom);
	const browserFilterValues = useAtomValue(
		filteredRecentlyAddedFilterValuesMapAtom,
	);
	const updateBrowserFilters = useUpdateRecentlyAddedFilters();
	const notify = useNotification();
	const capabilities = useAtomValue(mpdCapabilitiesAtom);
	const fastState = useAtomValue(recentlyAddedFastStateAtom);
	const loadMore = useSetAtom(loadMoreRecentlyAddedFastStateActionAtom);

	// Kick off the initial load when entering the page on a capable server.
	const isFast = capabilities.isMpd024OrLater;
	const fastEmpty = fastState.songs.length === 0;
	const hasAttemptedErrorRetryRef = useRef(false);
	const canRetryStaleError =
		fastState.error !== undefined && !hasAttemptedErrorRetryRef.current;
	const fastIdle =
		!fastState.isLoading &&
		fastState.hasMore &&
		(fastState.error === undefined || canRetryStaleError);
	useEffect(() => {
		if (isFast && fastEmpty && fastIdle) {
			if (fastState.error !== undefined) {
				hasAttemptedErrorRetryRef.current = true;
			}
			loadMore().catch((err) => {
				hasAttemptedErrorRetryRef.current = true;
				console.error("Failed to load recently added songs:", err);
				notify({
					status: "error",
					title: "Failed to load recently added songs",
					description: err instanceof Error ? err.message : String(err),
				});
			});
		}
	}, [isFast, fastEmpty, fastIdle, fastState.error, loadMore, notify]);

	const lastScrollErrorAtRef = useRef<number | undefined>(undefined);
	const hadErrorRef = useRef(fastState.error !== undefined);
	hadErrorRef.current = fastState.error !== undefined;

	const onScrolledNearBottom = useCallback(() => {
		if (
			lastScrollErrorAtRef.current !== undefined &&
			Date.now() - lastScrollErrorAtRef.current < SCROLL_RETRY_BACKOFF_MS
		) {
			return;
		}
		const wasInError = hadErrorRef.current;
		loadMore()
			.then(() => {
				lastScrollErrorAtRef.current = undefined;
			})
			.catch((err) => {
				lastScrollErrorAtRef.current = Date.now();
				console.error("Failed to load more recently added songs:", err);
				if (!wasInError) {
					notify({
						status: "error",
						title: "Failed to load more recently added songs",
						description: err instanceof Error ? err.message : String(err),
					});
				}
			});
	}, [loadMore, notify]);

	return {
		browserFilters,
		browserFilterValues,
		updateBrowserFilters,
		onScrolledNearBottom: isFast ? onScrolledNearBottom : undefined,
	};
}
