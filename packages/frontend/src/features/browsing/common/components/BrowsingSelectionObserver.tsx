import { useSetAtom, type WritableAtom } from "jotai";
import { useEffect } from "react";
import { useSearchParams } from "react-router";

/**
 * Mirrors LocationObserver's role but scoped to one browsing page: keeps the
 * resolved selection in step with the URL. Only `?vs=` tokens need this — an
 * inline selection is derived from the URL synchronously — but the resolution
 * has to be re-run whenever the query changes, including on Back and Forward.
 */
export function BrowsingSelectionObserver({
	restoreSelectionActionAtom,
}: {
	restoreSelectionActionAtom: WritableAtom<null, [string], Promise<void>>;
}) {
	const [searchParams] = useSearchParams();
	const restoreSelection = useSetAtom(restoreSelectionActionAtom);
	const search = searchParams.toString();

	useEffect(() => {
		restoreSelection(search);
	}, [search, restoreSelection]);

	return null;
}
