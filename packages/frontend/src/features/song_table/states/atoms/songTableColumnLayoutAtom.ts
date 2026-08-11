import { atom } from "jotai";
import { atomWithDefault } from "jotai/utils";
import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import {
	buildDeviceSettingKey,
	DEVICE_SETTING_KEY_SONG_TABLE_COLUMN_LAYOUT,
	deviceSettingsRepositoryAtom,
} from "../../../common";
import { buildSongTableColumnLayout } from "../../functions/songTableColumnLayout";
import type { SongTableColumnLayout } from "../../types/songTableTypes";
import { songTableStateRepositoryAtom } from "./songTableStateRepositoryAtom";

const songTableColumnLayoutKey = buildDeviceSettingKey(
	DEVICE_SETTING_KEY_SONG_TABLE_COLUMN_LAYOUT,
);

// Not a per-profile key: column widths and sort order have nothing to do
// with which music library is loaded.

// One-time migration: with no device key yet, copy the width/sort values the
// server document still carries. Once the key exists the server is never
// consulted again. Goes through songTableStateRepositoryAtom, not the sibling
// songTableStateAsyncAtom, because songTableAtom.ts depends on this atom.
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
