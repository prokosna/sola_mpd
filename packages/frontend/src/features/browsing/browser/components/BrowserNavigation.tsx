import type { BrowserFilter } from "@sola_mpd/shared/src/models/browser_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import type { UpdateMode } from "../../../../types/stateTypes";
import { BrowserNavigationView } from "../../common/components/BrowserNavigationView";
import { updateBrowserFiltersActionAtom } from "../states/actions/updateBrowserFiltersActionAtom";
import {
	browserFiltersAtom,
	filteredBrowserFilterValuesMapAtom,
} from "../states/atoms/browserFiltersAtom";

export function BrowserNavigation() {
	const browserFilters = useAtomValue(browserFiltersAtom);
	const browserFilterValues = useAtomValue(filteredBrowserFilterValuesMapAtom);
	const updateBrowserFiltersAction = useSetAtom(updateBrowserFiltersActionAtom);

	const updateBrowserFilters = useCallback(
		async (filters: BrowserFilter[], mode: UpdateMode) => {
			await updateBrowserFiltersAction({ filters, mode });
		},
		[updateBrowserFiltersAction],
	);

	return (
		<BrowserNavigationView
			{...{ browserFilters, browserFilterValues, updateBrowserFilters }}
		/>
	);
}
