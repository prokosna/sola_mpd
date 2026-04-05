import type { BrowserFilter } from "@sola_mpd/shared/src/models/browser_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import type { UpdateMode } from "../../../../types/stateTypes";
import { BrowserNavigationBreadcrumbsView } from "../../common/components/BrowserNavigationBreadcrumbsView";
import { updateBrowserFiltersActionAtom } from "../states/actions/updateBrowserFiltersActionAtom";
import { browserFiltersAtom } from "../states/atoms/browserFiltersAtom";

/**
 * Renders the navigation breadcrumbs for the browser.
 */
export function BrowserNavigationBreadcrumbs() {
	const browserFilters = useAtomValue(browserFiltersAtom);
	const updateBrowserFiltersAction = useSetAtom(updateBrowserFiltersActionAtom);

	const updateBrowserFilters = useCallback(
		async (filters: BrowserFilter[], mode: UpdateMode) => {
			await updateBrowserFiltersAction({ filters, mode });
		},
		[updateBrowserFiltersAction],
	);

	return (
		<BrowserNavigationBreadcrumbsView
			{...{ browserFilters, updateBrowserFilters }}
		/>
	);
}
