import { atom, type Getter } from "jotai";

import {
	buildDeviceProfileSettingKey,
	DEVICE_SETTING_KEY_RECENTLY_ADDED_LAST_POSITION,
} from "../../../../common/const/deviceSettingKeys";
import { deviceSettingsRepositoryAtom } from "../../../../common/states/atoms/deviceSettingsRepositoryAtom";
import { currentMpdProfileAtom } from "../../../../profile/states/atoms/mpdProfileAtom";
import { RECENTLY_ADDED_SELECTION_QUERY_PARAM } from "../../../common/const/browsingSelectionQueryParams";
import { deserializeBrowserSelection } from "../../../common/functions/deserializeBrowserSelection";
import { decodeBrowserSelectionValue } from "../../../common/functions/serializeBrowserSelection";
import { viewStateBlobRepositoryAtom } from "../../../common/states/atoms/viewStateBlobRepositoryAtom";
import type { BrowserSelection } from "../../../common/types/browserSelection";
import { resolvedRecentlyAddedSelectionAtom } from "../atoms/recentlyAddedSelectionAtom";
import { setIsRecentlyAddedLoadingActionAtom } from "./setIsRecentlyAddedLoadingActionAtom";
import type { RecentlyAddedSelectionQueryParam } from "./updateRecentlyAddedSelectionActionAtom";

// See restoreBrowserSelectionActionAtom.ts's counterpart for the rationale;
// a token that fails to resolve degrades to an empty selection.
async function resolveRecentlyAddedSelectionToken(
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

export type RestoreRecentlyAddedSelectionResult = {
	redirectSearch?: string;
};

/**
 * Recently Added counterpart of restoreBrowserSelectionActionAtom — see that
 * file for the full rationale.
 */
export const restoreRecentlyAddedSelectionActionAtom = atom(
	null,
	async (
		get,
		set,
		search: string,
	): Promise<RestoreRecentlyAddedSelectionResult> => {
		const deserialized = deserializeBrowserSelection(
			search,
			RECENTLY_ADDED_SELECTION_QUERY_PARAM,
		);

		if (
			deserialized.kind === "selection" &&
			deserialized.selection.length > 0
		) {
			set(resolvedRecentlyAddedSelectionAtom, deserialized.selection);
			return {};
		}

		if (deserialized.kind === "token") {
			set(setIsRecentlyAddedLoadingActionAtom, true);
			const selection = await resolveRecentlyAddedSelectionToken(
				get,
				deserialized.token,
			);
			set(resolvedRecentlyAddedSelectionAtom, selection);
			return {};
		}

		const profile = get(currentMpdProfileAtom);
		if (profile === undefined) {
			set(resolvedRecentlyAddedSelectionAtom, []);
			return {};
		}
		const cacheKey = buildDeviceProfileSettingKey(
			profile.name,
			DEVICE_SETTING_KEY_RECENTLY_ADDED_LAST_POSITION,
		);
		const cached = get(
			deviceSettingsRepositoryAtom,
		).get<RecentlyAddedSelectionQueryParam>(cacheKey);
		if (cached === undefined) {
			set(resolvedRecentlyAddedSelectionAtom, []);
			return {};
		}

		const cachedSearch = new URLSearchParams({
			[cached.key]: cached.value,
		}).toString();
		const cachedDeserialized = deserializeBrowserSelection(
			cachedSearch,
			RECENTLY_ADDED_SELECTION_QUERY_PARAM,
		);
		if (cachedDeserialized.kind === "selection") {
			set(resolvedRecentlyAddedSelectionAtom, cachedDeserialized.selection);
		} else {
			set(setIsRecentlyAddedLoadingActionAtom, true);
			const selection = await resolveRecentlyAddedSelectionToken(
				get,
				cachedDeserialized.token,
			);
			set(resolvedRecentlyAddedSelectionAtom, selection);
		}
		return { redirectSearch: cachedSearch };
	},
);
