import { VIEW_STATE_BLOB_QUERY_PARAM } from "../const/browsingSelectionQueryParams";
import type { DeserializedBrowserSelection } from "../types/browserSelection";

import { decodeBrowserSelectionValue } from "./serializeBrowserSelection";

/**
 * Pure, synchronous read of a navigation position out of a URL query string.
 * Performs no I/O: a `?vs=<token>` reference is recognised but left
 * unresolved for the caller (an action atom) to fetch via
 * ViewStateBlobRepository.
 *
 * `selectionQueryParam` is the inline-value key to look for (Browser and
 * Recently Added each use their own, see `browsingSelectionQueryParams.ts`).
 */
export function deserializeBrowserSelection(
	search: string,
	selectionQueryParam: string,
): DeserializedBrowserSelection {
	const params = new URLSearchParams(search);

	const token = params.get(VIEW_STATE_BLOB_QUERY_PARAM);
	if (token !== null && token.length > 0) {
		return { kind: "token", token };
	}

	const raw = params.get(selectionQueryParam);
	if (raw === null || raw.length === 0) {
		return { kind: "selection", selection: [] };
	}

	return { kind: "selection", selection: decodeBrowserSelectionValue(raw) };
}
