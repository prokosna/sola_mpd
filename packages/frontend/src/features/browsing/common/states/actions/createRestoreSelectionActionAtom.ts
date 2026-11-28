import {
	atom,
	type Getter,
	type PrimitiveAtom,
	type WritableAtom,
} from "jotai";

import { deserializeBrowserSelection } from "../../functions/deserializeBrowserSelection";
import { decodeBrowserSelectionValue } from "../../functions/serializeBrowserSelection";
import type { BrowserSelection } from "../../types/browserSelection";
import { viewStateBlobRepositoryAtom } from "../atoms/viewStateBlobRepositoryAtom";

// A token that fails to resolve — 404, offline, or minted by a different
// machine's local server in the Desktop build — degrades to an empty
// selection rather than raising.
async function resolveSelectionToken(
	get: Getter,
	token: string,
): Promise<BrowserSelection> {
	try {
		const payload = await get(viewStateBlobRepositoryAtom).fetch(token);
		if (payload === undefined) {
			return [];
		}
		return decodeBrowserSelectionValue(payload);
	} catch (e) {
		console.error(e);
		return [];
	}
}

/**
 * Builds the action that resolves a `?vs=` token into the feature's
 * resolved-selection atom. An inline selection needs no I/O — the selection
 * atom derives it from the URL — but a token does, and it raises the feature's
 * existing loading state while it runs.
 */
export function createRestoreSelectionActionAtom(config: {
	selectionQueryParam: string;
	resolvedSelectionAtom: PrimitiveAtom<BrowserSelection>;
	setIsLoadingActionAtom: WritableAtom<null, [boolean], void>;
}) {
	const { selectionQueryParam, resolvedSelectionAtom, setIsLoadingActionAtom } =
		config;

	// Last call wins: a slow token resolution must not overwrite a newer one.
	let generation = 0;
	let isTokenInFlight = false;

	return atom(null, async (get, set, search: string): Promise<void> => {
		const current = ++generation;
		const deserialized = deserializeBrowserSelection(
			search,
			selectionQueryParam,
		);

		if (deserialized.kind === "selection") {
			// Cleared as well as set: a token result must not outlive the URL
			// that referenced it.
			set(resolvedSelectionAtom, deserialized.selection);
			if (isTokenInFlight) {
				// The superseded request will never clear the loading flag itself.
				isTokenInFlight = false;
				set(setIsLoadingActionAtom, false);
			}
			return;
		}

		isTokenInFlight = true;
		set(setIsLoadingActionAtom, true);
		const resolved = await resolveSelectionToken(get, deserialized.token);
		if (current !== generation) {
			return;
		}
		isTokenInFlight = false;
		set(resolvedSelectionAtom, resolved);
	});
}
