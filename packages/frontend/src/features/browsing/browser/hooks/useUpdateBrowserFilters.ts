import type { BrowserFilter } from "@sola_mpd/shared/src/models/browser_pb.js";
import { useSetAtom } from "jotai";
import { useCallback } from "react";
import { useSearchParams } from "react-router";

import type { UpdateMode } from "../../../../types/stateTypes";
import { BROWSER_SELECTION_QUERY_PARAM } from "../../common/const/browsingSelectionQueryParams";
import { applySelectionQueryParam } from "../../common/functions/applySelectionQueryParam";
import { extractBrowserSelectionFromFilters } from "../../common/functions/browserFilter";
import { updateBrowserFiltersActionAtom } from "../states/actions/updateBrowserFiltersActionAtom";
import { updateBrowserSelectionActionAtom } from "../states/actions/updateBrowserSelectionActionAtom";

/**
 * Splits a merged `BrowserFilter[]` update the way docs/design/state-scoping.md
 * §14.3(b) requires: the structural half (tag/order) is persisted to the
 * server via updateBrowserFiltersActionAtom, while the navigation half
 * (selected values) is written to the URL. React Router's `useSearchParams`
 * can only be called from a component/hook, not from inside a Jotai atom —
 * hence this hook rather than folding the URL write into the action itself.
 */
export function useUpdateBrowserFilters() {
	const [, setSearchParams] = useSearchParams();
	const updateBrowserFiltersAction = useSetAtom(updateBrowserFiltersActionAtom);
	const updateBrowserSelectionAction = useSetAtom(
		updateBrowserSelectionActionAtom,
	);

	return useCallback(
		async (filters: BrowserFilter[], mode: UpdateMode) => {
			await updateBrowserFiltersAction({ filters, mode });

			const selection = extractBrowserSelectionFromFilters(filters);
			const result = await updateBrowserSelectionAction(selection);

			setSearchParams(
				(prev) =>
					applySelectionQueryParam(prev, BROWSER_SELECTION_QUERY_PARAM, result),
				{ replace: true },
			);
		},
		[updateBrowserFiltersAction, updateBrowserSelectionAction, setSearchParams],
	);
}
