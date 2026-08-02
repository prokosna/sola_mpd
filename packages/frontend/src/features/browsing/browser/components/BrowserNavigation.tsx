import { useAtomValue } from "jotai";

import { BrowserNavigationView } from "../../common/components/BrowserNavigationView";
import { useUpdateBrowserFilters } from "../hooks/useUpdateBrowserFilters";
import {
	browserFiltersAtom,
	filteredBrowserFilterValuesMapAtom,
} from "../states/atoms/browserFiltersAtom";

export function BrowserNavigation() {
	const browserFilters = useAtomValue(browserFiltersAtom);
	const browserFilterValues = useAtomValue(filteredBrowserFilterValuesMapAtom);
	const updateBrowserFilters = useUpdateBrowserFilters();

	return (
		<BrowserNavigationView
			{...{ browserFilters, browserFilterValues, updateBrowserFilters }}
		/>
	);
}
