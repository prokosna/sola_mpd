import { useSetAtom } from "jotai";
import { useCallback } from "react";

import { RECENTLY_ADDED_SELECTION_QUERY_PARAM } from "../../common/const/browsingSelectionQueryParams";
import { useApplySelectionToUrl } from "../../common/hooks/useApplySelectionToUrl";
import type { BrowserSelection } from "../../common/types/browserSelection";
import { updateRecentlyAddedSelectionActionAtom } from "../states/actions/updateRecentlyAddedSelectionActionAtom";

/** A pure selection edit (breadcrumbs): no panel set to diff against. */
export function useUpdateRecentlyAddedSelection() {
	const updateSelectionAction = useSetAtom(
		updateRecentlyAddedSelectionActionAtom,
	);
	const applySelectionToUrl = useApplySelectionToUrl(
		RECENTLY_ADDED_SELECTION_QUERY_PARAM,
	);

	return useCallback(
		async (selection: BrowserSelection) => {
			const result = await updateSelectionAction(selection);
			applySelectionToUrl(result);
		},
		[updateSelectionAction, applySelectionToUrl],
	);
}
