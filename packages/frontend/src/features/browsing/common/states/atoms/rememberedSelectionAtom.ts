import { atom } from "jotai";
import { atomWithDefault } from "jotai/utils";

import {
	buildDeviceSettingKey,
	deviceSettingsRepositoryAtom,
} from "../../../../common";
import type { SelectionQueryParam } from "../../types/browserSelection";

/**
 * Device-scoped memory of a browsing page's last selection query param.
 * Supplies a default at entry time only — the URL stays the single source of
 * truth once hydrated, so this is never read back except to seed it.
 */
export function createRememberedSelectionAtom(deviceSettingKey: string) {
	const key = buildDeviceSettingKey(deviceSettingKey);

	const rememberedSelectionBaseAtom = atomWithDefault<
		SelectionQueryParam | undefined
	>((get) => get(deviceSettingsRepositoryAtom).get<SelectionQueryParam>(key));

	return atom(
		(get) => get(rememberedSelectionBaseAtom),
		(get, set, value: SelectionQueryParam | undefined) => {
			set(rememberedSelectionBaseAtom, value);
			const repository = get(deviceSettingsRepositoryAtom);
			if (value === undefined) {
				repository.remove(key);
			} else {
				repository.set(key, value);
			}
		},
	);
}
