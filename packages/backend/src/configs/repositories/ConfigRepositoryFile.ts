import fs from "node:fs";
import path from "node:path";

import {
	create,
	fromJson,
	type JsonObject,
	type Message,
	toJson,
} from "@bufbuild/protobuf";
import type { GenMessage } from "@bufbuild/protobuf/codegenv2";
import {
	DB_FILE_NAME_BROWSER_STATE,
	DB_FILE_NAME_COMMON_SONG_TABLE_STATE,
	DB_FILE_NAME_MPD_PROFILE_STATE,
	DB_FILE_NAME_PLUGIN_STATE,
	DB_FILE_NAME_RECENTLY_ADDED_STATE,
	DB_FILE_NAME_SAVED_SEARCHES,
} from "@sola_mpd/shared/src/const/database.js";
import {
	CONFIG_KEY_BROWSER_STATE,
	CONFIG_KEY_COMMON_SONG_TABLE_STATE,
	CONFIG_KEY_MPD_PROFILE_STATE,
	CONFIG_KEY_PLUGIN_STATE,
	CONFIG_KEY_RECENTLY_ADDED_STATE,
	CONFIG_KEY_SAVED_SEARCHES,
} from "@sola_mpd/shared/src/const/socketio.js";
import {
	BrowserFilterSchema,
	type BrowserState,
	BrowserStateSchema,
} from "@sola_mpd/shared/src/models/browser_pb.js";
import {
	type MpdProfileState,
	MpdProfileStateSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import {
	type PluginState,
	PluginStateSchema,
} from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import {
	RecentlyAddedFilterSchema,
	type RecentlyAddedState,
	RecentlyAddedStateSchema,
} from "@sola_mpd/shared/src/models/recently_added_pb.js";
import {
	type SavedSearches,
	SavedSearchesSchema,
} from "@sola_mpd/shared/src/models/search_pb.js";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import {
	type SongTableState,
	SongTableStateSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";

import type { ConfigKey } from "../functions/migrateConfigDocument.js";
import {
	getConfigDocumentCurrentVersion,
	migrateConfigDocument,
} from "../functions/migrateConfigDocument.js";
import { preserveDeprecatedConfigFields } from "../functions/preserveDeprecatedConfigFields.js";
import { backupDbDirectory } from "../utils/backupDbDirectory.js";
import type {
	ConfigRepositories,
	ConfigRepository,
} from "./ConfigRepository.js";

const backedUpDirectories = new Set<string>();

// The backup has to precede the first *write*: reads are non-destructive, and
// deferring it this far keeps a bare module import — all a unit test does —
// from writing into the real db directory.
function backupDbDirectoryOnce(dbDirectory: string) {
	const key = path.resolve(dbDirectory);
	if (backedUpDirectories.has(key)) {
		return;
	}
	backedUpDirectories.add(key);
	backupDbDirectory(dbDirectory);
}

export class ConfigRepositoryFile<T extends Message & { schemaVersion: number }>
	implements ConfigRepository<T>
{
	private localCache: T;
	private readonly localFilePath: string;

	constructor(
		private readonly dbDirectory: string,
		fileName: string,
		private schema: GenMessage<T>,
		private configKey: ConfigKey,
		defaultValue: T,
	) {
		this.localFilePath = path.join(dbDirectory, fileName);
		const dirPath = path.dirname(this.localFilePath);
		try {
			fs.mkdirSync(dirPath, { recursive: true });
			const fileContent = fs.readFileSync(this.localFilePath, "utf-8");

			// Migrate the raw JSON before anything else touches it. Running this
			// after the fill-in loop below would let the loop inject the current
			// schemaVersion into a legacy document, silently disabling migration
			// forever for that file.
			const fileContentJson = migrateConfigDocument(
				this.configKey,
				JSON.parse(fileContent) as JsonObject,
			);

			const defaultValueJson = toJson(schema, defaultValue);
			for (const [key, value] of Object.entries(
				defaultValueJson as JsonObject,
			)) {
				if (!(key in fileContentJson)) {
					fileContentJson[key] = value;
				}
			}
			// Without this, a field the schema no longer knows rejects the whole
			// document and the catch below fails startup.
			this.localCache = fromJson(schema, fileContentJson, {
				ignoreUnknownFields: true,
			});
		} catch (err) {
			if ((err as NodeJS.ErrnoException).code === "ENOENT") {
				this.localCache = defaultValue;
				this.save(defaultValue);
				return;
			}
			const reason = err instanceof Error ? err.message : String(err);
			throw new Error(
				`Failed to load config file "${path.resolve(this.localFilePath)}": ${reason}. Fix or restore the file from backup, or move/delete it to reset this config to defaults.`,
				{ cause: err },
			);
		}
	}

	get(): T {
		return this.localCache;
	}

	update(value: T) {
		const next = preserveDeprecatedConfigFields(
			this.configKey,
			value,
			this.localCache,
		);
		this.save(next);
		this.localCache = next;
	}

	private save(value: T) {
		backupDbDirectoryOnce(this.dbDirectory);

		value.schemaVersion = getConfigDocumentCurrentVersion(this.configKey);

		const dirPath = path.dirname(this.localFilePath);
		const tempFilePath = path.join(
			dirPath,
			`.${path.basename(this.localFilePath)}.${process.pid}.${Date.now()}.tmp`,
		);
		try {
			fs.writeFileSync(
				tempFilePath,
				JSON.stringify(toJson(this.schema, value), undefined, 2),
			);
			fs.renameSync(tempFilePath, this.localFilePath);
		} catch (err) {
			fs.rmSync(tempFilePath, { force: true });
			throw err;
		}
	}
}

export function createConfigRepositoriesFile(
	dbDirectory: string,
): ConfigRepositories {
	return {
		browserState: new ConfigRepositoryFile<BrowserState>(
			dbDirectory,
			DB_FILE_NAME_BROWSER_STATE,
			BrowserStateSchema,
			CONFIG_KEY_BROWSER_STATE,
			create(BrowserStateSchema, {
				schemaVersion: getConfigDocumentCurrentVersion(
					CONFIG_KEY_BROWSER_STATE,
				),
				filters: [
					create(BrowserFilterSchema, {
						tag: Song_MetadataTag.GENRE,
						order: 0,
						selectedValues: [],
						selectedOrder: -1,
					}),
					create(BrowserFilterSchema, {
						tag: Song_MetadataTag.ARTIST,
						order: 1,
						selectedValues: [],
						selectedOrder: -1,
					}),
					create(BrowserFilterSchema, {
						tag: Song_MetadataTag.ALBUM,
						order: 2,
						selectedValues: [],
						selectedOrder: -1,
					}),
					create(BrowserFilterSchema, {
						tag: Song_MetadataTag.COMPOSER,
						order: 3,
						selectedValues: [],
						selectedOrder: -1,
					}),
				],
				filterTags: [
					Song_MetadataTag.GENRE,
					Song_MetadataTag.ARTIST,
					Song_MetadataTag.ALBUM,
					Song_MetadataTag.COMPOSER,
				],
			}),
		),
		commonSongTableState: new ConfigRepositoryFile<SongTableState>(
			dbDirectory,
			DB_FILE_NAME_COMMON_SONG_TABLE_STATE,
			SongTableStateSchema,
			CONFIG_KEY_COMMON_SONG_TABLE_STATE,
			create(SongTableStateSchema, {
				schemaVersion: getConfigDocumentCurrentVersion(
					CONFIG_KEY_COMMON_SONG_TABLE_STATE,
				),
				columns: [
					{
						tag: Song_MetadataTag.TITLE,
						widthFlex: 1,
					},
					{
						tag: Song_MetadataTag.ARTIST,
						widthFlex: 1,
					},
					{
						tag: Song_MetadataTag.ALBUM,
						widthFlex: 1,
					},
				],
				columnTags: [
					Song_MetadataTag.TITLE,
					Song_MetadataTag.ARTIST,
					Song_MetadataTag.ALBUM,
				],
			}),
		),
		mpdProfileState: new ConfigRepositoryFile<MpdProfileState>(
			dbDirectory,
			DB_FILE_NAME_MPD_PROFILE_STATE,
			MpdProfileStateSchema,
			CONFIG_KEY_MPD_PROFILE_STATE,
			create(MpdProfileStateSchema, {
				schemaVersion: getConfigDocumentCurrentVersion(
					CONFIG_KEY_MPD_PROFILE_STATE,
				),
				profiles: [],
			}),
		),
		pluginState: new ConfigRepositoryFile<PluginState>(
			dbDirectory,
			DB_FILE_NAME_PLUGIN_STATE,
			PluginStateSchema,
			CONFIG_KEY_PLUGIN_STATE,
			create(PluginStateSchema, {
				schemaVersion: getConfigDocumentCurrentVersion(CONFIG_KEY_PLUGIN_STATE),
				plugins: [],
			}),
		),
		recentlyAddedState: new ConfigRepositoryFile<RecentlyAddedState>(
			dbDirectory,
			DB_FILE_NAME_RECENTLY_ADDED_STATE,
			RecentlyAddedStateSchema,
			CONFIG_KEY_RECENTLY_ADDED_STATE,
			create(RecentlyAddedStateSchema, {
				schemaVersion: getConfigDocumentCurrentVersion(
					CONFIG_KEY_RECENTLY_ADDED_STATE,
				),
				filters: [
					create(RecentlyAddedFilterSchema, {
						tag: Song_MetadataTag.ALBUM,
					}),
					create(RecentlyAddedFilterSchema, {
						tag: Song_MetadataTag.ARTIST,
					}),
					create(RecentlyAddedFilterSchema, {
						tag: Song_MetadataTag.COMPOSER,
					}),
				],
				filterTags: [
					Song_MetadataTag.ALBUM,
					Song_MetadataTag.ARTIST,
					Song_MetadataTag.COMPOSER,
				],
			}),
		),
		savedSearches: new ConfigRepositoryFile<SavedSearches>(
			dbDirectory,
			DB_FILE_NAME_SAVED_SEARCHES,
			SavedSearchesSchema,
			CONFIG_KEY_SAVED_SEARCHES,
			create(SavedSearchesSchema, {
				schemaVersion: getConfigDocumentCurrentVersion(
					CONFIG_KEY_SAVED_SEARCHES,
				),
				searches: [],
			}),
		),
	};
}
