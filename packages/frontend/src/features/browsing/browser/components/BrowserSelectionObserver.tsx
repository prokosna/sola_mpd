import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { useSearchParams } from "react-router";

import { restoreBrowserSelectionActionAtom } from "../states/actions/restoreBrowserSelectionActionAtom";

/**
 * Mirrors LocationObserver's role but scoped to the Browser page: resolves
 * the navigation position out of the URL (or the last-position cache when
 * the URL carries none) whenever the search string changes, and reflects a
 * cache-restored position back into the address bar. See
 * docs/design/state-scoping.md §14.3(b).
 */
export function BrowserSelectionObserver() {
	const [searchParams, setSearchParams] = useSearchParams();
	const restoreBrowserSelection = useSetAtom(restoreBrowserSelectionActionAtom);
	const search = searchParams.toString();

	useEffect(() => {
		let cancelled = false;
		restoreBrowserSelection(search).then((result) => {
			if (!cancelled && result.redirectSearch !== undefined) {
				setSearchParams(result.redirectSearch, { replace: true });
			}
		});
		return () => {
			cancelled = true;
		};
	}, [search, restoreBrowserSelection, setSearchParams]);

	return null;
}
