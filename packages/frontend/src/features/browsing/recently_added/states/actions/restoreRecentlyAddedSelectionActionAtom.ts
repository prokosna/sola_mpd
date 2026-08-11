import { RECENTLY_ADDED_SELECTION_QUERY_PARAM } from "../../../common/const/browsingSelectionQueryParams";
import { createRestoreSelectionActionAtom } from "../../../common/states/actions/createRestoreSelectionActionAtom";
import { resolvedRecentlyAddedSelectionAtom } from "../atoms/recentlyAddedSelectionAtom";
import { setIsRecentlyAddedLoadingActionAtom } from "./setIsRecentlyAddedLoadingActionAtom";

export const restoreRecentlyAddedSelectionActionAtom =
	createRestoreSelectionActionAtom({
		selectionQueryParam: RECENTLY_ADDED_SELECTION_QUERY_PARAM,
		resolvedSelectionAtom: resolvedRecentlyAddedSelectionAtom,
		setIsLoadingActionAtom: setIsRecentlyAddedLoadingActionAtom,
	});
