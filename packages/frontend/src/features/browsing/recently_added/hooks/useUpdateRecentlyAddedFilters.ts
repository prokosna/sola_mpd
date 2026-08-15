import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import { RECENTLY_ADDED_SELECTION_QUERY_PARAM } from "../../common/const/browsingSelectionQueryParams";
import {
	haveBrowserFilterTagsChanged,
	mergeBrowserSelectionFromViews,
} from "../../common/functions/browserFilter";
import { useApplySelectionToUrl } from "../../common/hooks/useApplySelectionToUrl";
import type { BrowserFilterView } from "../../common/types/browserFilterView";
import { updateRecentlyAddedFilterTagsActionAtom } from "../states/actions/updateRecentlyAddedFilterTagsActionAtom";
import { updateRecentlyAddedSelectionActionAtom } from "../states/actions/updateRecentlyAddedSelectionActionAtom";
import { recentlyAddedFilterTagsAtom } from "../states/atoms/recentlyAddedFiltersAtom";
import { recentlyAddedSelectionAtom } from "../states/atoms/recentlyAddedSelectionAtom";

/**
 * Recently Added counterpart of useUpdateBrowserFilters — see that file for
 * the full rationale.
 */
export function useUpdateRecentlyAddedFilters() {
	const currentTags = useAtomValue(recentlyAddedFilterTagsAtom);
	const currentSelection = useAtomValue(recentlyAddedSelectionAtom);
	const updateFilterTagsAction = useSetAtom(
		updateRecentlyAddedFilterTagsActionAtom,
	);
	const updateSelectionAction = useSetAtom(
		updateRecentlyAddedSelectionActionAtom,
	);
	const applySelectionToUrl = useApplySelectionToUrl(
		RECENTLY_ADDED_SELECTION_QUERY_PARAM,
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
