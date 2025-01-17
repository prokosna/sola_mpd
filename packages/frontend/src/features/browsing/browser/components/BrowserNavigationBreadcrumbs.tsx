import { BrowserNavigationBreadcrumbsView } from "../../common/components/BrowserNavigationBreadcrumbsView";
import {
	useBrowserFiltersState,
	useUpdateBrowserFiltersState,
} from "../states/browserFiltersState";

/**
 * Renders the navigation breadcrumbs for the browser.
 * This component fetches the current browser filters and update function,
 * then passes them to the BrowserNavigationBreadcrumbsView component.
 * @returns A React component displaying the browser navigation breadcrumbs
 */
export function BrowserNavigationBreadcrumbs() {
	const browserFilters = useBrowserFiltersState();
	const updateBrowserFilters = useUpdateBrowserFiltersState();

	return (
		<BrowserNavigationBreadcrumbsView
			{...{ browserFilters, updateBrowserFilters }}
		/>
	);
}
