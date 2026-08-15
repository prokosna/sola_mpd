import { VIEW_STATE_BLOB_QUERY_PARAM } from "../const/browsingSelectionQueryParams";
import type { SelectionQueryParam } from "../types/browserSelection";

/**
 * Mirrors `deserializeBrowserSelection`'s precedence: `?vs=` wins over the
 * inline param, and an empty value counts as absent.
 */
export function readSelectionQueryParam(
	search: string,
	selectionQueryParam: string,
): SelectionQueryParam | undefined {
	const params = new URLSearchParams(search);

	const token = params.get(VIEW_STATE_BLOB_QUERY_PARAM);
	if (token !== null && token.length > 0) {
		return { key: VIEW_STATE_BLOB_QUERY_PARAM, value: token };
	}

	const raw = params.get(selectionQueryParam);
	if (raw === null || raw.length === 0) {
		return undefined;
	}

	return { key: selectionQueryParam, value: raw };
}

export function shouldHydrateFromMemory(
	currentQueryParam: SelectionQueryParam | undefined,
	remembered: SelectionQueryParam | undefined,
): boolean {
	return currentQueryParam === undefined && remembered !== undefined;
}
