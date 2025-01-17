import { BrowserNavigationView } from "../../common/components/BrowserNavigationView";
import {
	useBrowserFilterValuesMapState,
	useBrowserFiltersState,
	useUpdateBrowserFiltersState,
} from "../states/browserFiltersState";

/**
 * Component for rendering the browser navigation.
 *
 * This component fetches the current browser filters, filter values,
 * and the update function for browser filters. It then passes these
 * props to the BrowserNavigationView component.
 *
 * @returns The rendered BrowserNavigationView component
 */
export function BrowserNavigation() {
	const browserFilters = useBrowserFiltersState();
	const browserFilterValues = useBrowserFilterValuesMapState();
	const updateBrowserFilters = useUpdateBrowserFiltersState();

	return (
		<BrowserNavigationView
			{...{ browserFilters, browserFilterValues, updateBrowserFilters }}
		/>
	);
}
