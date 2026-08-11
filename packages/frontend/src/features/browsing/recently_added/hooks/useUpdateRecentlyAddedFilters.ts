import type { BrowserFilter } from "@sola_mpd/shared/src/models/browser_pb.js";
import { useSetAtom } from "jotai";
import { useCallback } from "react";

import { RECENTLY_ADDED_SELECTION_QUERY_PARAM } from "../../common/const/browsingSelectionQueryParams";
import { extractBrowserSelectionFromFilters } from "../../common/functions/browserFilter";
import { useApplySelectionToUrl } from "../../common/hooks/useApplySelectionToUrl";
import { updateRecentlyAddedFiltersActionAtom } from "../states/actions/updateRecentlyAddedFiltersActionAtom";
import { updateRecentlyAddedSelectionActionAtom } from "../states/actions/updateRecentlyAddedSelectionActionAtom";

/**
 * Recently Added counterpart of useUpdateBrowserFilters — see that file for
 * the full rationale.
 */
export function useUpdateRecentlyAddedFilters() {
	const updateFiltersAction = useSetAtom(updateRecentlyAddedFiltersActionAtom);
	const updateSelectionAction = useSetAtom(
		updateRecentlyAddedSelectionActionAtom,
	);
	const applySelectionToUrl = useApplySelectionToUrl(
		RECENTLY_ADDED_SELECTION_QUERY_PARAM,
	);

	return useCallback(
		async (filters: BrowserFilter[]) => {
			await updateFiltersAction(filters);

			const selection = extractBrowserSelectionFromFilters(filters);
			const result = await updateSelectionAction(selection);

			applySelectionToUrl(result);
		},
		[updateFiltersAction, updateSelectionAction, applySelectionToUrl],
	);
}
