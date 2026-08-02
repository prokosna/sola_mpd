import { useAtomValue } from "jotai";

import { BrowserNavigationBreadcrumbsView } from "../../common/components/BrowserNavigationBreadcrumbsView";
import { useUpdateBrowserFilters } from "../hooks/useUpdateBrowserFilters";
import { browserFiltersAtom } from "../states/atoms/browserFiltersAtom";

export function BrowserNavigationBreadcrumbs() {
	const browserFilters = useAtomValue(browserFiltersAtom);
	const updateBrowserFilters = useUpdateBrowserFilters();

	return (
		<BrowserNavigationBreadcrumbsView
			{...{ browserFilters, updateBrowserFilters }}
		/>
	);
}
