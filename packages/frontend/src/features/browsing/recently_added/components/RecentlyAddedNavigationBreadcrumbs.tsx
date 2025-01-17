import { BrowserNavigationBreadcrumbsView } from "../../common/components/BrowserNavigationBreadcrumbsView";
import {
	useRecentlyAddedBrowserFiltersState,
	useUpdateRecentlyAddedBrowserFiltersState,
} from "../states/recentlyAddedFiltersState";

export function RecentlyAddedNavigationBreadcrumbs() {
	const browserFilters = useRecentlyAddedBrowserFiltersState();
	const updateBrowserFilters = useUpdateRecentlyAddedBrowserFiltersState();

	return (
		<BrowserNavigationBreadcrumbsView
			{...{ browserFilters, updateBrowserFilters }}
		/>
	);
}
