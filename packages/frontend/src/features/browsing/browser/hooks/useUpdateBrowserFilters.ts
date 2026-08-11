import type { BrowserFilter } from "@sola_mpd/shared/src/models/browser_pb.js";
import { useSetAtom } from "jotai";
import { useCallback } from "react";

import type { UpdateMode } from "../../../../types/stateTypes";
import { BROWSER_SELECTION_QUERY_PARAM } from "../../common/const/browsingSelectionQueryParams";
import { extractBrowserSelectionFromFilters } from "../../common/functions/browserFilter";
import { useApplySelectionToUrl } from "../../common/hooks/useApplySelectionToUrl";
import { updateBrowserFiltersActionAtom } from "../states/actions/updateBrowserFiltersActionAtom";
import { updateBrowserSelectionActionAtom } from "../states/actions/updateBrowserSelectionActionAtom";

/**
 * Splits a merged `BrowserFilter[]` update in two: the structural half
 * (tag/order) is persisted to the server via updateBrowserFiltersActionAtom,
 * while the navigation half (selected values) is written to the URL.
 * `useSearchParams` cannot be called from inside a Jotai atom, so the URL half
 * lives in a hook.
 */
export function useUpdateBrowserFilters() {
	const updateBrowserFiltersAction = useSetAtom(updateBrowserFiltersActionAtom);
	const updateBrowserSelectionAction = useSetAtom(
		updateBrowserSelectionActionAtom,
	);
	const applySelectionToUrl = useApplySelectionToUrl(
		BROWSER_SELECTION_QUERY_PARAM,
	);

	return useCallback(
		async (filters: BrowserFilter[], mode: UpdateMode) => {
			await updateBrowserFiltersAction({ filters, mode });

			const selection = extractBrowserSelectionFromFilters(filters);
			const result = await updateBrowserSelectionAction(selection);

			applySelectionToUrl(result);
		},
		[
			updateBrowserFiltersAction,
			updateBrowserSelectionAction,
			applySelectionToUrl,
		],
	);
}
