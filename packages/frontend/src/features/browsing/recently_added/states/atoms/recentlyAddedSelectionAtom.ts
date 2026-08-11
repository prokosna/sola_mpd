import { RECENTLY_ADDED_SELECTION_QUERY_PARAM } from "../../../common/const/browsingSelectionQueryParams";
import {
	createResolvedSelectionAtom,
	createSelectionAtom,
} from "../../../common/states/atoms/browsingSelectionAtom";

/** Written by restoreRecentlyAddedSelectionActionAtom once it has resolved. */
export const resolvedRecentlyAddedSelectionAtom = createResolvedSelectionAtom();

/** The Recently Added page's current navigation position. */
export const recentlyAddedSelectionAtom = createSelectionAtom(
	RECENTLY_ADDED_SELECTION_QUERY_PARAM,
	resolvedRecentlyAddedSelectionAtom,
);
