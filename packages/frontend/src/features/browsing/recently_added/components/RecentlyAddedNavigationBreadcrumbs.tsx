import { BrowserNavigationBreadcrumbsView } from "../../common/components/BrowserNavigationBreadcrumbsView";
import {
	useRecentlyAddedBrowserFiltersState,
	useUpdateRecentlyAddedBrowserFiltersState,
} from "../states/recentlyAddedFiltersState";

/**
 * Renders the navigation breadcrumbs for recently added items.
 * This component fetches the current browser filters and update function,
 * then passes them to the BrowserNavigationBreadcrumbsView component.
 * @returns A React component displaying the recently added navigation breadcrumbs
 */
export function RecentlyAddedNavigationBreadcrumbs() {
	const browserFilters = useRecentlyAddedBrowserFiltersState();
	const updateBrowserFilters = useUpdateRecentlyAddedBrowserFiltersState();

	return (
		<BrowserNavigationBreadcrumbsView
			{...{ browserFilters, updateBrowserFilters }}
		/>
	);
}
