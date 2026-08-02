import { atom } from "jotai";
import { atomWithDefault } from "jotai/utils";

import {
	buildDeviceSettingKey,
	DEVICE_SETTING_KEY_SONG_TABLE_COLUMN_LAYOUT,
} from "../../../../lib/deviceSettings/deviceSettingKeys";
import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import { deviceSettingsRepositoryAtom } from "../../../common/states/atoms/deviceSettingsRepositoryAtom";
import { buildSongTableColumnLayout } from "../../functions/songTableColumnLayout";
import type { SongTableColumnLayout } from "../../types/songTableTypes";
import { songTableStateRepositoryAtom } from "./songTableStateRepositoryAtom";

const songTableColumnLayoutKey = buildDeviceSettingKey(
	DEVICE_SETTING_KEY_SONG_TABLE_COLUMN_LAYOUT,
);

// Not a per-profile key: column widths and sort order have nothing to do
// with which music library is loaded (docs/design/state-scoping.md §14.3(c)).

// atomWithDefault (async) is where the one-time migration lives. On the very
// first read, if the device key is unset, fetch the SongTableState the
// server still returns — the proto is unchanged, so old width_flex/sort_order
// /is_sort_desc values are still sitting there — and copy them into the
// device layout before returning it. Once the key exists, later reads never
// touch the server again; the device value is authoritative from then on.
// Reading songTableStateRepositoryAtom directly (rather than the sibling
// songTableStateAsyncAtom in songTableAtom.ts) avoids a circular import
// between the two atom files, since songTableAtom.ts's derived
// songTableStateAtom itself depends on this atom for the overlay.
const songTableColumnLayoutAsyncAtom = atomWithDefault<
	Promise<SongTableColumnLayout> | SongTableColumnLayout
>(async (get) => {
	const repository = get(deviceSettingsRepositoryAtom);
	const stored = repository.get<SongTableColumnLayout>(
		songTableColumnLayoutKey,
	);
	if (stored !== undefined) {
		return stored;
	}
	const serverState = await get(songTableStateRepositoryAtom).fetch();
	const migrated = buildSongTableColumnLayout(serverState.columns);
	repository.set(songTableColumnLayoutKey, migrated);
	return migrated;
});

const songTableColumnLayoutUnwrappedAtom = atomWithSync(
	songTableColumnLayoutAsyncAtom,
);

export const songTableColumnLayoutAtom = atom(
	(get) => get(songTableColumnLayoutUnwrappedAtom) ?? {},
	(get, set, layout: SongTableColumnLayout) => {
		set(songTableColumnLayoutAsyncAtom, layout);
		get(deviceSettingsRepositoryAtom).set(songTableColumnLayoutKey, layout);
	},
);
