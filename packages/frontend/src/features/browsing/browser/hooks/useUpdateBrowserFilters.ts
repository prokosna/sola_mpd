import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import { BROWSER_SELECTION_QUERY_PARAM } from "../../common/const/browsingSelectionQueryParams";
import {
	haveBrowserFilterTagsChanged,
	mergeBrowserSelectionFromViews,
} from "../../common/functions/browserFilter";
import { useApplySelectionToUrl } from "../../common/hooks/useApplySelectionToUrl";
import type { BrowserFilterView } from "../../common/types/browserFilterView";
import { updateBrowserFilterTagsActionAtom } from "../states/actions/updateBrowserFilterTagsActionAtom";
import { updateBrowserSelectionActionAtom } from "../states/actions/updateBrowserSelectionActionAtom";
import { browserFilterTagsAtom } from "../states/atoms/browserFiltersAtom";
import { browserSelectionAtom } from "../states/atoms/browserSelectionAtom";

/**
 * Takes a full new panel set, splits the update in two: the tag set (if it
 * changed) goes to the workspace, the selection — folded back into
 * chronological order — goes to the URL.
 */
export function useUpdateBrowserFilters() {
	const currentTags = useAtomValue(browserFilterTagsAtom);
	const currentSelection = useAtomValue(browserSelectionAtom);
	const updateFilterTagsAction = useSetAtom(updateBrowserFilterTagsActionAtom);
	const updateSelectionAction = useSetAtom(updateBrowserSelectionActionAtom);
	const applySelectionToUrl = useApplySelectionToUrl(
		BROWSER_SELECTION_QUERY_PARAM,
	);

	return useCallback(
		async (views: BrowserFilterView[]) => {
			const newTags = views.map((view) => view.tag);
			if (
				currentTags === undefined ||
				haveBrowserFilterTagsChanged(currentTags, newTags)
			) {
				await updateFilterTagsAction(newTags);
			}

			const newSelection = mergeBrowserSelectionFromViews(
				currentSelection,
				views,
			);
			const result = await updateSelectionAction(newSelection);
			applySelectionToUrl(result);
		},
		[
			currentTags,
			currentSelection,
			updateFilterTagsAction,
			updateSelectionAction,
			applySelectionToUrl,
		],
	);
}
