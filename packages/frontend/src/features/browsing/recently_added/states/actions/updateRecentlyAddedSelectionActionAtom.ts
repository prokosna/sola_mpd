import { atom } from "jotai";
import { showNotification } from "../../../../../lib/mantine/showNotification";
import {
	buildDeviceProfileSettingKey,
	DEVICE_SETTING_KEY_RECENTLY_ADDED_LAST_POSITION,
} from "../../../../common/const/deviceSettingKeys";
import { deviceSettingsRepositoryAtom } from "../../../../common/states/atoms/deviceSettingsRepositoryAtom";
import { currentMpdProfileAtom } from "../../../../profile/states/atoms/mpdProfileAtom";
import {
	RECENTLY_ADDED_SELECTION_QUERY_PARAM,
	VIEW_STATE_BLOB_QUERY_PARAM,
} from "../../../common/const/browsingSelectionQueryParams";
import { serializeBrowserSelection } from "../../../common/functions/serializeBrowserSelection";
import { viewStateBlobRepositoryAtom } from "../../../common/states/atoms/viewStateBlobRepositoryAtom";
import type { BrowserSelection } from "../../../common/types/browserSelection";

export type RecentlyAddedSelectionQueryParam = { key: string; value: string };

/**
 * Recently Added counterpart of updateBrowserSelectionActionAtom — see that
 * file for the full rationale. Kept as a separate action (rather than a
 * parametrized shared one) because it wires a different device cache key and
 * loading atom, matching how the two features' state-persistence actions are
 * already separate (updateBrowserStateActionAtom / updateRecentlyAddedStateActionAtom).
 */
export const updateRecentlyAddedSelectionActionAtom = atom(
	null,
	async (
		get,
		_set,
		selection: BrowserSelection,
	): Promise<RecentlyAddedSelectionQueryParam | undefined> => {
		const profile = get(currentMpdProfileAtom);
		const cacheKey =
			profile === undefined
				? undefined
				: buildDeviceProfileSettingKey(
						profile.name,
						DEVICE_SETTING_KEY_RECENTLY_ADDED_LAST_POSITION,
					);

		if (selection.length === 0) {
			if (cacheKey !== undefined) {
				get(deviceSettingsRepositoryAtom).remove(cacheKey);
			}
			return undefined;
		}

		const serialized = serializeBrowserSelection(selection);
		let result: RecentlyAddedSelectionQueryParam;
		if (serialized.kind === "inline") {
			result = {
				key: RECENTLY_ADDED_SELECTION_QUERY_PARAM,
				value: serialized.value,
			};
		} else {
			try {
				const token = await get(viewStateBlobRepositoryAtom).save(
					serialized.payload,
				);
				result = { key: VIEW_STATE_BLOB_QUERY_PARAM, value: token };
			} catch (e) {
				console.error(e);
				showNotification({
					title: "Could not save browsing position",
					description: e instanceof Error ? e.message : String(e),
					status: "error",
				});
				return undefined;
			}
		}

		if (cacheKey !== undefined) {
			get(deviceSettingsRepositoryAtom).set(cacheKey, result);
		}
		return result;
	},
);
