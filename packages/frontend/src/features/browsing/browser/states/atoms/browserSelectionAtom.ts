import { atom } from "jotai";

import { searchParamsAtom } from "../../../../location/states/atoms/locationAtom";
import { BROWSER_SELECTION_QUERY_PARAM } from "../../../common/const/browsingSelectionQueryParams";
import { deserializeBrowserSelection } from "../../../common/functions/deserializeBrowserSelection";
import type { BrowserSelection } from "../../../common/types/browserSelection";

/**
 * Written by restoreBrowserSelectionActionAtom once it resolves a `?vs=`
 * token or the device's last-position cache — cases that require I/O and
 * can't be derived synchronously from the URL alone. Starts empty so the
 * page renders with no selection until resolution completes.
 */
export const resolvedBrowserSelectionAtom = atom<BrowserSelection>([]);

/**
 * The current navigation position. The URL is authoritative whenever it
 * carries an explicit inline selection (the common case — pure and
 * synchronous, no I/O). Otherwise (a `?vs=` token still being resolved, or no
 * selection query at all) falls back to whatever restoreBrowserSelectionActionAtom
 * last resolved. See docs/design/state-scoping.md §14.3(b).
 */
export const browserSelectionAtom = atom((get) => {
	const deserialized = deserializeBrowserSelection(
		get(searchParamsAtom),
		BROWSER_SELECTION_QUERY_PARAM,
	);
	if (deserialized.kind === "selection" && deserialized.selection.length > 0) {
		return deserialized.selection;
	}
	return get(resolvedBrowserSelectionAtom);
});
