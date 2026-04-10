import type { BrowserFilter } from "@sola_mpd/shared/src/models/browser_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import type { UpdateMode } from "../../../../types/stateTypes";
import { BrowserNavigationBreadcrumbsView } from "../../common/components/BrowserNavigationBreadcrumbsView";
import { updateRecentlyAddedBrowserFiltersActionAtom } from "../states/actions/updateRecentlyAddedBrowserFiltersActionAtom";
import { recentlyAddedBrowserFiltersAtom } from "../states/atoms/recentlyAddedFiltersAtom";

export function RecentlyAddedNavigationBreadcrumbs() {
	const browserFilters = useAtomValue(recentlyAddedBrowserFiltersAtom);
	const updateFiltersAction = useSetAtom(
		updateRecentlyAddedBrowserFiltersActionAtom,
	);

	const updateBrowserFilters = useCallback(
		async (filters: BrowserFilter[], _mode: UpdateMode) => {
			await updateFiltersAction(filters);
		},
		[updateFiltersAction],
	);

	return (
		<BrowserNavigationBreadcrumbsView
			{...{ browserFilters, updateBrowserFilters }}
		/>
	);
}
