import { atom, type PrimitiveAtom } from "jotai";

import { searchParamsAtom } from "../../../../location/states/atoms/locationAtom";
import { deserializeBrowserSelection } from "../../functions/deserializeBrowserSelection";
import type { BrowserSelection } from "../../types/browserSelection";

/**
 * Holds the position the restore action fetched for a `?vs=` token, which
 * cannot be derived synchronously from the URL.
 */
export function createResolvedSelectionAtom(): PrimitiveAtom<BrowserSelection> {
	return atom<BrowserSelection>([]);
}

/**
 * The current navigation position. The URL wins whenever it carries an
 * explicit inline selection (the common case — pure and synchronous, no I/O);
 * otherwise the last value the restore action resolved is used.
 */
export function createSelectionAtom(
	selectionQueryParam: string,
	resolvedSelectionAtom: PrimitiveAtom<BrowserSelection>,
) {
	return atom((get) => {
		const deserialized = deserializeBrowserSelection(
			get(searchParamsAtom),
			selectionQueryParam,
		);
		if (
			deserialized.kind === "selection" &&
			deserialized.selection.length > 0
		) {
			return deserialized.selection;
		}
		return get(resolvedSelectionAtom);
	});
}
