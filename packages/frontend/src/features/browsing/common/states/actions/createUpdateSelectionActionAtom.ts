import { atom } from "jotai";

import { showNotification } from "../../../../../lib/mantine/showNotification";
import {
	buildDeviceProfileSettingKey,
	deviceSettingsRepositoryAtom,
} from "../../../../common";
import { currentMpdProfileAtom } from "../../../../profile/states/atoms/mpdProfileAtom";
import { VIEW_STATE_BLOB_QUERY_PARAM } from "../../const/browsingSelectionQueryParams";
import { serializeBrowserSelection } from "../../functions/serializeBrowserSelection";
import type {
	BrowserSelection,
	SelectionQueryParam,
} from "../../types/browserSelection";
import { viewStateBlobRepositoryAtom } from "../atoms/viewStateBlobRepositoryAtom";

/**
 * Builds the action that turns a navigation position into the query param the
 * caller should apply to the URL (`undefined` clears it), saving to a View
 * State Blob when the serialized selection is too long to inline. It also
 * refreshes the per-profile last-position cache so the position can be
 * restored on next startup — see `createRestoreSelectionActionAtom`.
 *
 * This is the only place that writes to ViewStateBlobRepository;
 * serializeBrowserSelection itself stays pure and I/O-free.
 *
 * Browser and Recently Added differ only in which inline query param they mint
 * and which device key they cache under, so both bind this one implementation
 * rather than keeping a copy each.
 */
export function createUpdateSelectionActionAtom(config: {
	selectionQueryParam: string;
	lastPositionSettingKey: string;
}) {
	const { selectionQueryParam, lastPositionSettingKey } = config;

	return atom(
		null,
		async (
			get,
			_set,
			selection: BrowserSelection,
		): Promise<SelectionQueryParam | undefined> => {
			const profile = get(currentMpdProfileAtom);
			const cacheKey =
				profile === undefined
					? undefined
					: buildDeviceProfileSettingKey(profile.name, lastPositionSettingKey);

			if (selection.length === 0) {
				if (cacheKey !== undefined) {
					get(deviceSettingsRepositoryAtom).remove(cacheKey);
				}
				return undefined;
			}

			const serialized = serializeBrowserSelection(selection);
			let result: SelectionQueryParam;
			if (serialized.kind === "inline") {
				result = { key: selectionQueryParam, value: serialized.value };
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
}
