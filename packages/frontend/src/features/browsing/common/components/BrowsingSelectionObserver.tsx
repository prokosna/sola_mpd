import { useAtomValue, useSetAtom, type WritableAtom } from "jotai";
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";

import {
	readSelectionQueryParam,
	shouldHydrateFromMemory,
} from "../functions/browsingSelectionMemory";
import { useApplySelectionToUrl } from "../hooks/useApplySelectionToUrl";
import type { SelectionQueryParam } from "../types/browserSelection";

/**
 * Mirrors LocationObserver's role but scoped to one browsing page. Only `?vs=`
 * tokens need the resolution — an inline selection is derived from the URL
 * synchronously — but it has to re-run whenever the query changes, including
 * on Back and Forward. A bare URL is seeded from memory once per mount.
 */
export function BrowsingSelectionObserver({
	selectionQueryParam,
	rememberedSelectionAtom,
	restoreSelectionActionAtom,
}: {
	selectionQueryParam: string;
	rememberedSelectionAtom: WritableAtom<
		SelectionQueryParam | undefined,
		[SelectionQueryParam | undefined],
		void
	>;
	restoreSelectionActionAtom: WritableAtom<null, [string], Promise<void>>;
}) {
	const [searchParams] = useSearchParams();
	const restoreSelection = useSetAtom(restoreSelectionActionAtom);
	const remembered = useAtomValue(rememberedSelectionAtom);
	const setRemembered = useSetAtom(rememberedSelectionAtom);
	const applySelectionToUrl = useApplySelectionToUrl(selectionQueryParam);
	const search = searchParams.toString();
	const hydratedRef = useRef(false);
	// StrictMode double-invokes this effect for the same render (no cleanup
	// runs in between). hydratingSearchRef makes a repeat call for the same
	// bare search a no-op, so it can't fall through and clobber memory
	// before the replace lands.
	const hydratingSearchRef = useRef<string | undefined>(undefined);

	// biome-ignore lint/correctness/useExhaustiveDependencies: `remembered` is excluded because this effect writes it below, and reacting to its own write would retrigger every run.
	useEffect(() => {
		if (hydratingSearchRef.current !== undefined) {
			if (hydratingSearchRef.current === search) {
				return;
			}
			hydratingSearchRef.current = undefined;
		}

		const current = readSelectionQueryParam(search, selectionQueryParam);

		if (!hydratedRef.current && shouldHydrateFromMemory(current, remembered)) {
			hydratedRef.current = true;
			hydratingSearchRef.current = search;
			applySelectionToUrl(remembered, { replace: true });
			return;
		}

		hydratedRef.current = true;
		setRemembered(current);
		restoreSelection(search);
	}, [
		search,
		selectionQueryParam,
		restoreSelection,
		setRemembered,
		applySelectionToUrl,
	]);

	return null;
}
