import type { JsonObject } from "@bufbuild/protobuf";
import {
	CONFIG_KEY_BROWSER_STATE,
	CONFIG_KEY_COMMON_SONG_TABLE_STATE,
	CONFIG_KEY_MPD_PROFILE_STATE,
	CONFIG_KEY_PLUGIN_STATE,
	CONFIG_KEY_RECENTLY_ADDED_STATE,
	CONFIG_KEY_SAVED_SEARCHES,
} from "@sola_mpd/shared/src/const/socketio.js";

export type ConfigKey =
	| typeof CONFIG_KEY_BROWSER_STATE
	| typeof CONFIG_KEY_COMMON_SONG_TABLE_STATE
	| typeof CONFIG_KEY_MPD_PROFILE_STATE
	| typeof CONFIG_KEY_PLUGIN_STATE
	| typeof CONFIG_KEY_RECENTLY_ADDED_STATE
	| typeof CONFIG_KEY_SAVED_SEARCHES;

export type ConfigDocumentMigration = (doc: JsonObject) => JsonObject;

export type ConfigMigrationChainTable = Record<
	ConfigKey,
	ConfigDocumentMigration[]
>;

// v1 -> v2 for common_song_table_state: derives the shared column set from
// the legacy per-column array, leaving `columns` in place. A column with no
// `tag` is dropped: proto3 JSON omits the zero-valued enum, and fromJson
// rejects a null list item.
function migrateCommonSongTableStateV1ToV2(doc: JsonObject): JsonObject {
	const columns = Array.isArray(doc.columns) ? doc.columns : [];
	const columnTags = columns
		.filter((column) => (column as JsonObject).tag !== undefined)
		.map((column) => (column as JsonObject).tag);
	return { ...doc, columnTags };
}

// v1 -> v2 for browser_state: the legacy display order lives in the `order`
// field, so sort by it before deriving filterTags. A filter with no `tag` is
// dropped; see migrateCommonSongTableStateV1ToV2.
function migrateBrowserStateV1ToV2(doc: JsonObject): JsonObject {
	const filters = Array.isArray(doc.filters) ? doc.filters : [];
	const filterTags = [...filters]
		.filter((filter) => (filter as JsonObject).tag !== undefined)
		.sort(
			(a, b) =>
				(((a as JsonObject).order as number) ?? 0) -
				(((b as JsonObject).order as number) ?? 0),
		)
		.map((filter) => (filter as JsonObject).tag);
	return { ...doc, filterTags };
}

// v1 -> v2 for recently_added_state: filters never had an explicit order
// field, so array order already is the display order. A filter with no
// `tag` is dropped; see migrateCommonSongTableStateV1ToV2.
function migrateRecentlyAddedStateV1ToV2(doc: JsonObject): JsonObject {
	const filters = Array.isArray(doc.filters) ? doc.filters : [];
	const filterTags = filters
		.filter((filter) => (filter as JsonObject).tag !== undefined)
		.map((filter) => (filter as JsonObject).tag);
	return { ...doc, filterTags };
}

// v1 -> v2 for saved_searches: each search's columns split into a plain
// column set plus a sort list, the latter built from whichever columns
// carried a sortOrder, ordered by it. A column with no `tag` is dropped from
// both; see migrateCommonSongTableStateV1ToV2.
function migrateSavedSearchesV1ToV2(doc: JsonObject): JsonObject {
	const searches = Array.isArray(doc.searches) ? doc.searches : [];
	const migratedSearches = searches.map((search) => {
		const searchObj = search as JsonObject;
		const columns = Array.isArray(searchObj.columns) ? searchObj.columns : [];
		const taggedColumns = columns.filter(
			(column) => (column as JsonObject).tag !== undefined,
		);
		const columnTags = taggedColumns.map(
			(column) => (column as JsonObject).tag,
		);
		const sort = taggedColumns
			.filter((column) => (column as JsonObject).sortOrder !== undefined)
			.sort(
				(a, b) =>
					((a as JsonObject).sortOrder as number) -
					((b as JsonObject).sortOrder as number),
			)
			.map((column) => ({
				tag: (column as JsonObject).tag,
				isDesc: (column as JsonObject).isSortDesc ?? false,
			}));
		return { ...searchObj, columnTags, sort };
	});
	return { ...doc, searches: migratedSearches };
}

// A document's current schema version is 1 + its chain length, so a version
// and its chain cannot drift apart.
export const CONFIG_MIGRATION_CHAINS: ConfigMigrationChainTable = {
	[CONFIG_KEY_BROWSER_STATE]: [migrateBrowserStateV1ToV2],
	[CONFIG_KEY_COMMON_SONG_TABLE_STATE]: [migrateCommonSongTableStateV1ToV2],
	[CONFIG_KEY_MPD_PROFILE_STATE]: [],
	[CONFIG_KEY_PLUGIN_STATE]: [],
	[CONFIG_KEY_RECENTLY_ADDED_STATE]: [migrateRecentlyAddedStateV1ToV2],
	[CONFIG_KEY_SAVED_SEARCHES]: [migrateSavedSearchesV1ToV2],
};

export function getConfigDocumentCurrentVersion(
	key: ConfigKey,
	chains: ConfigMigrationChainTable = CONFIG_MIGRATION_CHAINS,
): number {
	return 1 + chains[key].length;
}

// proto3 `uint32` defaults to 0 and `toJson` omits zero-valued fields, so a
// missing `schemaVersion` is indistinguishable from an explicit 0. Both are
// treated as version 1, the oldest schema this code understands.
function readDocumentVersion(doc: JsonObject): number {
	const raw = doc.schemaVersion;
	if (typeof raw !== "number" || raw === 0) {
		return 1;
	}
	return raw;
}

/**
 * Applies the migration chain for `key` to a raw JSON document (parsed from
 * disk, before `fromJson`). Must run before any step that fills in
 * top-level defaults, otherwise a legacy document gets stamped with the
 * current version without ever having been migrated.
 */
export function migrateConfigDocument(
	key: ConfigKey,
	doc: JsonObject,
	chains: ConfigMigrationChainTable = CONFIG_MIGRATION_CHAINS,
): JsonObject {
	const chain = chains[key];
	const version = readDocumentVersion(doc);
	let migrated = doc;
	// chain[i] takes a document at version i + 1 and produces version i + 2.
	for (let i = version - 1; i < chain.length; i++) {
		migrated = chain[i](migrated);
	}
	return migrated;
}
