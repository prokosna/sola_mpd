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

// A document's current schema version is 1 + its chain length, so a version
// and its chain cannot drift apart.
export const CONFIG_MIGRATION_CHAINS: ConfigMigrationChainTable = {
	[CONFIG_KEY_BROWSER_STATE]: [],
	[CONFIG_KEY_COMMON_SONG_TABLE_STATE]: [],
	[CONFIG_KEY_MPD_PROFILE_STATE]: [],
	[CONFIG_KEY_PLUGIN_STATE]: [],
	[CONFIG_KEY_RECENTLY_ADDED_STATE]: [],
	[CONFIG_KEY_SAVED_SEARCHES]: [],
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
