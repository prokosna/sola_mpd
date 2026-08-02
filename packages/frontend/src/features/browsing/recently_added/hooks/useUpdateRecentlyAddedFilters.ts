import type { BrowserFilter } from "@sola_mpd/shared/src/models/browser_pb.js";
import { useSetAtom } from "jotai";
import { useCallback } from "react";
import { useSearchParams } from "react-router";

import { RECENTLY_ADDED_SELECTION_QUERY_PARAM } from "../../common/const/browsingSelectionQueryParams";
import { applySelectionQueryParam } from "../../common/functions/applySelectionQueryParam";
import { extractBrowserSelectionFromFilters } from "../../common/functions/browserFilter";
import { updateRecentlyAddedBrowserFiltersActionAtom } from "../states/actions/updateRecentlyAddedBrowserFiltersActionAtom";
import { updateRecentlyAddedSelectionActionAtom } from "../states/actions/updateRecentlyAddedSelectionActionAtom";

/**
 * Recently Added counterpart of useUpdateBrowserFilters — see that file for
 * the full rationale.
 */
export function useUpdateRecentlyAddedFilters() {
	const [, setSearchParams] = useSearchParams();
	const updateFiltersAction = useSetAtom(
		updateRecentlyAddedBrowserFiltersActionAtom,
	);
	const updateSelectionAction = useSetAtom(
		updateRecentlyAddedSelectionActionAtom,
	);

	return useCallback(
		async (filters: BrowserFilter[]) => {
			await updateFiltersAction(filters);

			const selection = extractBrowserSelectionFromFilters(filters);
			const result = await updateSelectionAction(selection);

			setSearchParams(
				(prev) =>
					applySelectionQueryParam(
						prev,
						RECENTLY_ADDED_SELECTION_QUERY_PARAM,
						result,
					),
				{ replace: true },
			);
		},
		[updateFiltersAction, updateSelectionAction, setSearchParams],
	);
}
