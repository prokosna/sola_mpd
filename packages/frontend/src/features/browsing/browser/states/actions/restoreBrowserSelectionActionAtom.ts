import { BROWSER_SELECTION_QUERY_PARAM } from "../../../common/const/browsingSelectionQueryParams";
import { createRestoreSelectionActionAtom } from "../../../common/states/actions/createRestoreSelectionActionAtom";
import { resolvedBrowserSelectionAtom } from "../atoms/browserSelectionAtom";
import { setIsBrowserLoadingActionAtom } from "./setIsBrowserLoadingActionAtom";

export const restoreBrowserSelectionActionAtom =
	createRestoreSelectionActionAtom({
		selectionQueryParam: BROWSER_SELECTION_QUERY_PARAM,
		resolvedSelectionAtom: resolvedBrowserSelectionAtom,
		setIsLoadingActionAtom: setIsBrowserLoadingActionAtom,
	});
