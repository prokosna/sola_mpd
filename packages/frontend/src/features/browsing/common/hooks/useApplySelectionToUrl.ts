import { useCallback } from "react";
import { useSearchParams } from "react-router";

import { applySelectionQueryParam } from "../functions/applySelectionQueryParam";
import type { SelectionQueryParam } from "../types/browserSelection";

/**
 * Writes a resolved navigation position into the URL — pushed by default so
 * Back/Forward walk the browsing path, or replaced via `{ replace: true }`.
 *
 * Filter panels re-emit on every interaction, so a no-op update is dropped.
 */
export function useApplySelectionToUrl(selectionQueryParam: string) {
	const [searchParams, setSearchParams] = useSearchParams();

	return useCallback(
		(
			result: SelectionQueryParam | undefined,
			options?: { replace?: boolean },
		) => {
			const next = applySelectionQueryParam(
				searchParams,
				selectionQueryParam,
				result,
			);
			if (next.toString() === searchParams.toString()) {
				return;
			}
			setSearchParams(next, options);
		},
		[searchParams, setSearchParams, selectionQueryParam],
	);
}
