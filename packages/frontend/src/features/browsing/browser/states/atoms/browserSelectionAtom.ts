import { BROWSER_SELECTION_QUERY_PARAM } from "../../../common/const/browsingSelectionQueryParams";
import {
	createResolvedSelectionAtom,
	createSelectionAtom,
} from "../../../common/states/atoms/browsingSelectionAtoms";

/** Written by restoreBrowserSelectionActionAtom once it has resolved. */
export const resolvedBrowserSelectionAtom = createResolvedSelectionAtom();

/** The Browser page's current navigation position. */
export const browserSelectionAtom = createSelectionAtom(
	BROWSER_SELECTION_QUERY_PARAM,
	resolvedBrowserSelectionAtom,
);
