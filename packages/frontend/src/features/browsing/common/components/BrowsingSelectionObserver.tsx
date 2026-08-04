import { useSetAtom, type WritableAtom } from "jotai";
import { useEffect } from "react";
import { useSearchParams } from "react-router";

import type { RestoreSelectionResult } from "../states/actions/createRestoreSelectionActionAtom";

/**
 * Mirrors LocationObserver's role but scoped to one browsing page: resolves
 * the navigation position out of the URL (or the last-position cache when the
 * URL carries none) whenever the search string changes, and reflects a
 * cache-restored position back into the address bar.
 *
 * Browser and Recently Added pass their own restore action; nothing else about
 * the effect differs, so they share this component instead of one each.
 */
export function BrowsingSelectionObserver({
	restoreSelectionActionAtom,
}: {
	restoreSelectionActionAtom: WritableAtom<
		null,
		[string],
		Promise<RestoreSelectionResult>
	>;
}) {
	const [searchParams, setSearchParams] = useSearchParams();
	const restoreSelection = useSetAtom(restoreSelectionActionAtom);
	const search = searchParams.toString();

	useEffect(() => {
		let cancelled = false;
		restoreSelection(search).then((result) => {
			if (!cancelled && result.redirectSearch !== undefined) {
				setSearchParams(result.redirectSearch, { replace: true });
			}
		});
		return () => {
			cancelled = true;
		};
	}, [search, restoreSelection, setSearchParams]);

	return null;
}
