import {
	atom,
	type Getter,
	type PrimitiveAtom,
	type WritableAtom,
} from "jotai";

import { buildDeviceProfileSettingKey } from "../../../../common/const/deviceSettingKeys";
import { deviceSettingsRepositoryAtom } from "../../../../common/states/atoms/deviceSettingsRepositoryAtom";
import { currentMpdProfileAtom } from "../../../../profile/states/atoms/mpdProfileAtom";
import { deserializeBrowserSelection } from "../../functions/deserializeBrowserSelection";
import { decodeBrowserSelectionValue } from "../../functions/serializeBrowserSelection";
import type {
	BrowserSelection,
	SelectionQueryParam,
} from "../../types/browserSelection";
import { viewStateBlobRepositoryAtom } from "../atoms/viewStateBlobRepositoryAtom";

export type RestoreSelectionResult = {
	// Set when the position was restored from the device's last-position cache
	// rather than the live URL, so the caller can reflect it back into the
	// address bar.
	redirectSearch?: string;
};

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
 * Builds the action that resolves the current navigation position from the
 * URL's search string and writes it to the feature's resolved-selection atom.
 * An explicit inline selection resolves synchronously with no I/O. A `?vs=`
 * token, or no selection query at all (startup / a fresh tab), requires I/O
 * and raises the feature's existing loading state while it runs; no new
 * Suspense boundary is introduced.
 *
 * Browser and Recently Added differ only in the four values passed here, so
 * both bind this one implementation rather than keeping a copy each.
 */
export function createRestoreSelectionActionAtom(config: {
	selectionQueryParam: string;
	lastPositionSettingKey: string;
	resolvedSelectionAtom: PrimitiveAtom<BrowserSelection>;
	setIsLoadingActionAtom: WritableAtom<null, [boolean], void>;
}) {
	const {
		selectionQueryParam,
		lastPositionSettingKey,
		resolvedSelectionAtom,
		setIsLoadingActionAtom,
	} = config;

	return atom(
		null,
		async (get, set, search: string): Promise<RestoreSelectionResult> => {
			const deserialized = deserializeBrowserSelection(
				search,
				selectionQueryParam,
			);

			if (
				deserialized.kind === "selection" &&
				deserialized.selection.length > 0
			) {
				set(resolvedSelectionAtom, deserialized.selection);
				return {};
			}

			if (deserialized.kind === "token") {
				set(setIsLoadingActionAtom, true);
				const selection = await resolveSelectionToken(get, deserialized.token);
				set(resolvedSelectionAtom, selection);
				return {};
			}

			// No explicit selection in the URL: fall back to the last position
			// cached for the current profile (per-profile on purpose — a position
			// belongs to a library).
			const profile = get(currentMpdProfileAtom);
			if (profile === undefined) {
				set(resolvedSelectionAtom, []);
				return {};
			}
			const cacheKey = buildDeviceProfileSettingKey(
				profile.name,
				lastPositionSettingKey,
			);
			const cached = get(deviceSettingsRepositoryAtom).get<SelectionQueryParam>(
				cacheKey,
			);
			if (cached === undefined) {
				set(resolvedSelectionAtom, []);
				return {};
			}

			const cachedSearch = new URLSearchParams({
				[cached.key]: cached.value,
			}).toString();
			const cachedDeserialized = deserializeBrowserSelection(
				cachedSearch,
				selectionQueryParam,
			);
			if (cachedDeserialized.kind === "selection") {
				set(resolvedSelectionAtom, cachedDeserialized.selection);
			} else {
				set(setIsLoadingActionAtom, true);
				const selection = await resolveSelectionToken(
					get,
					cachedDeserialized.token,
				);
				set(resolvedSelectionAtom, selection);
			}
			return { redirectSearch: cachedSearch };
		},
	);
}
