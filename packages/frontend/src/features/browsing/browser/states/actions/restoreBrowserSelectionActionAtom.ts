import { atom, type Getter } from "jotai";

import {
	buildDeviceProfileSettingKey,
	DEVICE_SETTING_KEY_BROWSER_LAST_POSITION,
} from "../../../../../lib/deviceSettings/deviceSettingKeys";
import { deviceSettingsRepositoryAtom } from "../../../../common/states/atoms/deviceSettingsRepositoryAtom";
import { currentMpdProfileAtom } from "../../../../profile/states/atoms/mpdProfileAtom";
import { BROWSER_SELECTION_QUERY_PARAM } from "../../../common/const/browsingSelectionQueryParams";
import { deserializeBrowserSelection } from "../../../common/functions/deserializeBrowserSelection";
import { decodeBrowserSelectionValue } from "../../../common/functions/serializeBrowserSelection";
import { viewStateBlobRepositoryAtom } from "../../../common/states/atoms/viewStateBlobRepositoryAtom";
import type { BrowserSelection } from "../../../common/types/browserSelection";
import { resolvedBrowserSelectionAtom } from "../atoms/browserSelectionAtom";
import { setIsBrowserLoadingActionAtom } from "./setIsBrowserLoadingActionAtom";
import type { BrowserSelectionQueryParam } from "./updateBrowserSelectionActionAtom";

// A token that fails to resolve — 404, offline, or minted by a different
// machine's local server in the Desktop build — degrades to an empty
// selection rather than raising. See docs/design/state-scoping.md §14.3(b).
async function resolveBrowserSelectionToken(
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

export type RestoreBrowserSelectionResult = {
	// Set when the position was restored from the device's last-position
	// cache rather than the live URL, so the caller can reflect it back into
	// the address bar (docs/design/state-scoping.md §14.3(b): "redirect").
	redirectSearch?: string;
};

/**
 * Resolves the current navigation position from the URL's search string and
 * writes it to resolvedBrowserSelectionAtom. An explicit inline selection
 * resolves synchronously with no I/O. A `?vs=` token, or no selection query
 * at all (startup / a fresh tab), requires I/O and raises the existing
 * Browser loading state while it runs — see docs/design/state-scoping.md
 * §14.3(b); no new Suspense boundary is introduced.
 */
export const restoreBrowserSelectionActionAtom = atom(
	null,
	async (get, set, search: string): Promise<RestoreBrowserSelectionResult> => {
		const deserialized = deserializeBrowserSelection(
			search,
			BROWSER_SELECTION_QUERY_PARAM,
		);

		if (
			deserialized.kind === "selection" &&
			deserialized.selection.length > 0
		) {
			set(resolvedBrowserSelectionAtom, deserialized.selection);
			return {};
		}

		if (deserialized.kind === "token") {
			set(setIsBrowserLoadingActionAtom, true);
			const selection = await resolveBrowserSelectionToken(
				get,
				deserialized.token,
			);
			set(resolvedBrowserSelectionAtom, selection);
			return {};
		}

		// No explicit selection in the URL: fall back to the last position
		// cached for the current profile (per-profile on purpose — a position
		// belongs to a library, see docs/design/state-scoping.md §6.2).
		const profile = get(currentMpdProfileAtom);
		if (profile === undefined) {
			set(resolvedBrowserSelectionAtom, []);
			return {};
		}
		const cacheKey = buildDeviceProfileSettingKey(
			profile.name,
			DEVICE_SETTING_KEY_BROWSER_LAST_POSITION,
		);
		const cached = get(
			deviceSettingsRepositoryAtom,
		).get<BrowserSelectionQueryParam>(cacheKey);
		if (cached === undefined) {
			set(resolvedBrowserSelectionAtom, []);
			return {};
		}

		const cachedSearch = new URLSearchParams({
			[cached.key]: cached.value,
		}).toString();
		const cachedDeserialized = deserializeBrowserSelection(
			cachedSearch,
			BROWSER_SELECTION_QUERY_PARAM,
		);
		if (cachedDeserialized.kind === "selection") {
			set(resolvedBrowserSelectionAtom, cachedDeserialized.selection);
		} else {
			set(setIsBrowserLoadingActionAtom, true);
			const selection = await resolveBrowserSelectionToken(
				get,
				cachedDeserialized.token,
			);
			set(resolvedBrowserSelectionAtom, selection);
		}
		return { redirectSearch: cachedSearch };
	},
);
