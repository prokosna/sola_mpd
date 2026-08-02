import { atom } from "jotai";

import { searchParamsAtom } from "../../../../location/states/atoms/locationAtom";
import { RECENTLY_ADDED_SELECTION_QUERY_PARAM } from "../../../common/const/browsingSelectionQueryParams";
import { deserializeBrowserSelection } from "../../../common/functions/deserializeBrowserSelection";
import type { BrowserSelection } from "../../../common/types/browserSelection";

/**
 * Written by restoreRecentlyAddedSelectionActionAtom once it resolves a
 * `?vs=` token or the device's last-position cache. See the Browser
 * counterpart, browserSelectionAtom.ts, for the full rationale.
 */
export const resolvedRecentlyAddedSelectionAtom = atom<BrowserSelection>([]);

export const recentlyAddedSelectionAtom = atom((get) => {
	const deserialized = deserializeBrowserSelection(
		get(searchParamsAtom),
		RECENTLY_ADDED_SELECTION_QUERY_PARAM,
	);
	if (deserialized.kind === "selection" && deserialized.selection.length > 0) {
		return deserialized.selection;
	}
	return get(resolvedRecentlyAddedSelectionAtom);
});
