import { atom } from "jotai";
import { atomWithDefault } from "jotai/utils";
import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import {
	buildDeviceSettingKey,
	DEVICE_SETTING_KEY_SONG_TABLE_COLUMN_LAYOUT,
	DEVICE_SETTING_KEY_SONG_TABLE_LAYOUT,
	deviceSettingsRepositoryAtom,
} from "../../../common";
import { DEFAULT_SONG_TABLE_DEVICE_LAYOUT } from "../../const/songTableDefaults";
import type { LegacySongTableColumnLayout } from "../../functions/songTableDeviceLayoutMigration";
import { migrateSongTableDeviceLayout } from "../../functions/songTableDeviceLayoutMigration";
import type { SongTableDeviceLayout } from "../../types/songTableTypes";
import { songTableStateRepositoryAtom } from "./songTableStateRepositoryAtom";

const songTableLayoutKey = buildDeviceSettingKey(
	DEVICE_SETTING_KEY_SONG_TABLE_LAYOUT,
);
const legacySongTableColumnLayoutKey = buildDeviceSettingKey(
	DEVICE_SETTING_KEY_SONG_TABLE_COLUMN_LAYOUT,
);

// Not a per-profile key: column widths and sort order have nothing to do
// with which music library is loaded.

/**
 * One-time migration (DESIGN.md §7): legacy device key, then the workspace
 * document's deprecated per-column width/sort, then the defaults. A failed
 * workspace fetch resolves to the defaults for this session only —
 * `repository.set` below is skipped, so the next load retries.
 */
const songTableDeviceLayoutAsyncAtom = atomWithDefault<
	Promise<SongTableDeviceLayout> | SongTableDeviceLayout
>(async (get) => {
	const repository = get(deviceSettingsRepositoryAtom);
	const stored = repository.get<SongTableDeviceLayout>(songTableLayoutKey);
	if (stored !== undefined) {
		return stored;
	}

	const legacyLayout = repository.get<LegacySongTableColumnLayout>(
		legacySongTableColumnLayoutKey,
	);
	const result = await migrateSongTableDeviceLayout(legacyLayout, async () => {
		const serverState = await get(songTableStateRepositoryAtom).fetch();
		return serverState.columns;
	});

	if (result.status === "failed") {
		return DEFAULT_SONG_TABLE_DEVICE_LAYOUT;
	}
	repository.set(songTableLayoutKey, result.layout);
	return result.layout;
});

// `unwrap` resolves to `undefined` until the underlying promise first
// settles, which is exactly the "pending" signal consumers must see instead
// of a painted-in-defaults `{}` (DESIGN.md §7).
const songTableDeviceLayoutUnwrappedAtom = atomWithSync(
	songTableDeviceLayoutAsyncAtom,
);

export const songTableDeviceLayoutAtom = atom(
	(get) => get(songTableDeviceLayoutUnwrappedAtom),
	(get, set, layout: SongTableDeviceLayout) => {
		// Migration still pending: refuse the write rather than commit a value
		// derived from a state that has not resolved yet.
		if (get(songTableDeviceLayoutUnwrappedAtom) === undefined) {
			return;
		}
		set(songTableDeviceLayoutAsyncAtom, layout);
		get(deviceSettingsRepositoryAtom).set(songTableLayoutKey, layout);
	},
);
