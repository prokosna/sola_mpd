import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { useSearchParams } from "react-router";

import { restoreRecentlyAddedSelectionActionAtom } from "../states/actions/restoreRecentlyAddedSelectionActionAtom";

/**
 * Recently Added counterpart of BrowserSelectionObserver — see that
 * component for the full rationale.
 */
export function RecentlyAddedSelectionObserver() {
	const [searchParams, setSearchParams] = useSearchParams();
	const restoreRecentlyAddedSelection = useSetAtom(
		restoreRecentlyAddedSelectionActionAtom,
	);
	const search = searchParams.toString();

	useEffect(() => {
		let cancelled = false;
		restoreRecentlyAddedSelection(search).then((result) => {
			if (!cancelled && result.redirectSearch !== undefined) {
				setSearchParams(result.redirectSearch, { replace: true });
			}
		});
		return () => {
			cancelled = true;
		};
	}, [search, restoreRecentlyAddedSelection, setSearchParams]);

	return null;
}
