import { atom, type PrimitiveAtom } from "jotai";

import { searchParamsAtom } from "../../../../location/states/atoms/locationAtom";
import { deserializeBrowserSelection } from "../../functions/deserializeBrowserSelection";
import type { BrowserSelection } from "../../types/browserSelection";

/**
 * Holds the position resolved by the restore action once it has done I/O —
 * a `?vs=` token lookup or a read of the device's last-position cache, neither
 * of which can be derived synchronously from the URL. Starts empty so the page
 * renders with no selection until resolution completes.
 */
export function createResolvedSelectionAtom(): PrimitiveAtom<BrowserSelection> {
	return atom<BrowserSelection>([]);
}

/**
 * The current navigation position. The URL wins whenever it carries an
 * explicit inline selection (the common case — pure and synchronous, no I/O);
 * otherwise the last value the restore action resolved is used.
 *
 * Browser and Recently Added each own an inline query param and a resolved
 * atom, but that precedence rule is one rule and must not drift between them,
 * so it lives here rather than in each feature.
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
