import type { BrowserFilter } from "@sola_mpd/shared/src/models/browser_pb.js";
import { useAtomValue } from "jotai";
import { useCallback } from "react";

import type { UpdateMode } from "../../../../types/stateTypes";
import { BrowserNavigationBreadcrumbsView } from "../../common/components/BrowserNavigationBreadcrumbsView";
import { useUpdateRecentlyAddedFilters } from "../hooks/useUpdateRecentlyAddedFilters";
import { recentlyAddedFiltersAtom } from "../states/atoms/recentlyAddedFiltersAtom";

export function RecentlyAddedNavigationBreadcrumbs() {
	const browserFilters = useAtomValue(recentlyAddedFiltersAtom);
	const updateRecentlyAddedFilters = useUpdateRecentlyAddedFilters();

	const updateBrowserFilters = useCallback(
		async (filters: BrowserFilter[], _mode: UpdateMode) => {
			await updateRecentlyAddedFilters(filters);
		},
		[updateRecentlyAddedFilters],
	);

	return (
		<BrowserNavigationBreadcrumbsView
			{...{ browserFilters, updateBrowserFilters }}
		/>
	);
}
