import { useSetAtom } from "jotai";
import { useCallback } from "react";

import { BROWSER_SELECTION_QUERY_PARAM } from "../../common/const/browsingSelectionQueryParams";
import { useApplySelectionToUrl } from "../../common/hooks/useApplySelectionToUrl";
import type { BrowserSelection } from "../../common/types/browserSelection";
import { updateBrowserSelectionActionAtom } from "../states/actions/updateBrowserSelectionActionAtom";

/** A pure selection edit (breadcrumbs): no panel set to diff against. */
export function useUpdateBrowserSelection() {
	const updateSelectionAction = useSetAtom(updateBrowserSelectionActionAtom);
	const applySelectionToUrl = useApplySelectionToUrl(
		BROWSER_SELECTION_QUERY_PARAM,
	);

	return useCallback(
		async (selection: BrowserSelection) => {
			const result = await updateSelectionAction(selection);
			applySelectionToUrl(result);
		},
		[updateSelectionAction, applySelectionToUrl],
	);
}
