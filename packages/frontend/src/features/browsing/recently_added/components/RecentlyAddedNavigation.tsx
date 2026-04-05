import type { BrowserFilter } from "@sola_mpd/shared/src/models/browser_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import type { UpdateMode } from "../../../../types/stateTypes";
import { BrowserNavigationView } from "../../common/components/BrowserNavigationView";
import { updateRecentlyAddedBrowserFiltersActionAtom } from "../states/actions/updateRecentlyAddedBrowserFiltersActionAtom";
import {
	filteredRecentlyAddedBrowserFilterValuesMapAtom,
	recentlyAddedBrowserFiltersAtom,
} from "../states/atoms/recentlyAddedFiltersAtom";

/**
 * Component for rendering the navigation for recently added items.
 */
export function RecentlyAddedNavigation() {
	const browserFilters = useAtomValue(recentlyAddedBrowserFiltersAtom);
	const browserFilterValues = useAtomValue(
		filteredRecentlyAddedBrowserFilterValuesMapAtom,
	);
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
		<BrowserNavigationView
			{...{ browserFilters, browserFilterValues, updateBrowserFilters }}
		/>
	);
}
