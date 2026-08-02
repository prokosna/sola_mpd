import { atom } from "jotai";

import {
	buildDeviceProfileSettingKey,
	DEVICE_SETTING_KEY_BROWSER_LAST_POSITION,
} from "../../../../../lib/deviceSettings/deviceSettingKeys";
import { showNotification } from "../../../../../lib/mantine/showNotification";
import { deviceSettingsRepositoryAtom } from "../../../../common/states/atoms/deviceSettingsRepositoryAtom";
import { currentMpdProfileAtom } from "../../../../profile/states/atoms/mpdProfileAtom";
import {
	BROWSER_SELECTION_QUERY_PARAM,
	VIEW_STATE_BLOB_QUERY_PARAM,
} from "../../../common/const/browsingSelectionQueryParams";
import { serializeBrowserSelection } from "../../../common/functions/serializeBrowserSelection";
import { viewStateBlobRepositoryAtom } from "../../../common/states/atoms/viewStateBlobRepositoryAtom";
import type { BrowserSelection } from "../../../common/types/browserSelection";

export type BrowserSelectionQueryParam = { key: string; value: string };

/**
 * Turns a navigation position into the query param the caller should apply
 * to the URL (`undefined` clears it), saving to a View State Blob when the
 * serialized selection is too long to inline (docs/design/state-scoping.md
 * §14.3(b)). Also refreshes the per-profile last-position cache so the
 * position can be restored on next startup — see restoreBrowserSelectionActionAtom.
 *
 * This is the only place that touches ViewStateBlobRepository for writes;
 * serializeBrowserSelection itself stays pure and I/O-free.
 */
export const updateBrowserSelectionActionAtom = atom(
	null,
	async (
		get,
		_set,
		selection: BrowserSelection,
	): Promise<BrowserSelectionQueryParam | undefined> => {
		const profile = get(currentMpdProfileAtom);
		const cacheKey =
			profile === undefined
				? undefined
				: buildDeviceProfileSettingKey(
						profile.name,
						DEVICE_SETTING_KEY_BROWSER_LAST_POSITION,
					);

		if (selection.length === 0) {
			if (cacheKey !== undefined) {
				get(deviceSettingsRepositoryAtom).remove(cacheKey);
			}
			return undefined;
		}

		const serialized = serializeBrowserSelection(selection);
		let result: BrowserSelectionQueryParam;
		if (serialized.kind === "inline") {
			result = { key: BROWSER_SELECTION_QUERY_PARAM, value: serialized.value };
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
