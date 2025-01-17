import { BrowserNavigationView } from "../../common/components/BrowserNavigationView";
import {
	useRecentlyAddedBrowserFilterValuesMapState,
	useRecentlyAddedBrowserFiltersState,
	useUpdateRecentlyAddedBrowserFiltersState,
} from "../states/recentlyAddedFiltersState";

/**
 * Component for rendering the navigation for recently added items.
 * It uses browser filters, filter values, and update function to display
 * and manage the navigation view for recently added content.
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
