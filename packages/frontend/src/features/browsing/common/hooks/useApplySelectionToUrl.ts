import { useCallback } from "react";
import { useSearchParams } from "react-router";

import { applySelectionQueryParam } from "../functions/applySelectionQueryParam";
import type { SelectionQueryParam } from "../types/browserSelection";

/**
 * Writes a resolved navigation position into the URL, one history entry per
 * distinct position, so Back and Forward walk the user's browsing path.
 *
 * The filter panels re-emit on every interaction, so an update that leaves the
 * query unchanged is dropped instead of piling up duplicate entries.
 */
export function useApplySelectionToUrl(selectionQueryParam: string) {
	const [searchParams, setSearchParams] = useSearchParams();

	return useCallback(
		(result: SelectionQueryParam | undefined) => {
			const next = applySelectionQueryParam(
				searchParams,
				selectionQueryParam,
				result,
			);
			if (next.toString() === searchParams.toString()) {
				return;
			}
			setSearchParams(next);
		},
		[searchParams, setSearchParams, selectionQueryParam],
	);
}
