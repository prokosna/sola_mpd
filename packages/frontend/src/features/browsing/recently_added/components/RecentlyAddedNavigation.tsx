import { BrowserNavigationView } from "../../common/components/BrowserNavigationView";
import {
	useRecentlyAddedBrowserFilterValuesMapState,
	useRecentlyAddedBrowserFiltersState,
	useUpdateRecentlyAddedBrowserFiltersState,
} from "../states/recentlyAddedFiltersState";

/**
 * Navigation filters for recently added songs.
 */
export function RecentlyAddedNavigation() {
	const browserFilters = useRecentlyAddedBrowserFiltersState();
	const browserFilterValues = useRecentlyAddedBrowserFilterValuesMapState();
	const updateBrowserFilters = useUpdateRecentlyAddedBrowserFiltersState();

	return (
		<BrowserNavigationView
			{...{ browserFilters, browserFilterValues, updateBrowserFilters }}
		/>
	);
}
