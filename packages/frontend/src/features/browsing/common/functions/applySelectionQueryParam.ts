import { VIEW_STATE_BLOB_QUERY_PARAM } from "../const/browsingSelectionQueryParams";

/**
 * Replaces whichever selection-related query params were previously present
 * with the result of an `updateBrowserSelectionActionAtom` /
 * `updateRecentlyAddedSelectionActionAtom` call. `result` is `undefined` for
 * an empty selection, which clears both params.
 */
export function applySelectionQueryParam(
	prev: URLSearchParams,
	selectionQueryParam: string,
	result: { key: string; value: string } | undefined,
): URLSearchParams {
	const next = new URLSearchParams(prev);
	next.delete(selectionQueryParam);
	next.delete(VIEW_STATE_BLOB_QUERY_PARAM);
	if (result !== undefined) {
		next.set(result.key, result.value);
	}
	return next;
}
