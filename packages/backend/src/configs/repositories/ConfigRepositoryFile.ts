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
	DB_DIRECTORY,
	DB_FILE_BROWSER_STATE,
	DB_FILE_COMMON_SONG_TABLE_STATE,
	DB_FILE_MPD_PROFILE_STATE,
	DB_FILE_PLUGIN_STATE,
	DB_FILE_RECENTLY_ADDED_STATE,
	DB_FILE_SAVED_SEARCHES,
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
import { backupDbDirectory } from "../utils/backupDbDirectory.js";
import type { ConfigRepository } from "./ConfigRepository.js";

let hasAttemptedDbBackup = false;

// The backup has to precede the first *write*: reads are non-destructive, and
// deferring it this far keeps a bare module import — all a unit test does —
// from writing into the real db directory.
function backupDbDirectoryOnce() {
	if (hasAttemptedDbBackup) {
		return;
	}
	hasAttemptedDbBackup = true;
	backupDbDirectory(DB_DIRECTORY);
}

class ConfigRepositoryFile<T extends Message & { schemaVersion: number }>
	implements ConfigRepository<T>
{
	private localCache: T;

	constructor(
		private localFilePath: string,
		private schema: GenMessage<T>,
		private configKey: ConfigKey,
		defaultValue: T,
	) {
		this.localFilePath = localFilePath;
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

			// Make sure that the local cache has all the latest necessary fields.
			// Otherwise, copy the field from the default value.
			const defaultValueJson = toJson(schema, defaultValue);
			for (const [key, value] of Object.entries(
				defaultValueJson as JsonObject,
			)) {
				if (!(key in fileContentJson)) {
					fileContentJson[key] = value;
				}
			}
			this.localCache = fromJson(schema, fileContentJson);
		} catch (_) {
			this.localCache = defaultValue;
			this.save();
		}
	}

	get(): T {
		return this.localCache;
	}

	update(value: T) {
		this.localCache = value;
		this.save();
	}

	private save() {
		backupDbDirectoryOnce();

		this.localCache.schemaVersion = getConfigDocumentCurrentVersion(
			this.configKey,
		);

		const dirPath = path.dirname(this.localFilePath);
		const tempFilePath = path.join(
			dirPath,
			`.${path.basename(this.localFilePath)}.${process.pid}.${Date.now()}.tmp`,
		);
		fs.writeFileSync(
			tempFilePath,
			JSON.stringify(toJson(this.schema, this.localCache), null, 2),
		);
		fs.renameSync(tempFilePath, this.localFilePath);
	}
}

export const browserStateRepository = new ConfigRepositoryFile<BrowserState>(
	DB_FILE_BROWSER_STATE,
	BrowserStateSchema,
	CONFIG_KEY_BROWSER_STATE,
	create(BrowserStateSchema, {
		schemaVersion: getConfigDocumentCurrentVersion(CONFIG_KEY_BROWSER_STATE),
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
	}),
);

export const commonSongTableStateRepository =
	new ConfigRepositoryFile<SongTableState>(
		DB_FILE_COMMON_SONG_TABLE_STATE,
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
		}),
	);

export const mpdProfileStateRepository =
	new ConfigRepositoryFile<MpdProfileState>(
		DB_FILE_MPD_PROFILE_STATE,
		MpdProfileStateSchema,
		CONFIG_KEY_MPD_PROFILE_STATE,
		create(MpdProfileStateSchema, {
			schemaVersion: getConfigDocumentCurrentVersion(
				CONFIG_KEY_MPD_PROFILE_STATE,
			),
			profiles: [],
		}),
	);

export const pluginStateRepository = new ConfigRepositoryFile<PluginState>(
	DB_FILE_PLUGIN_STATE,
	PluginStateSchema,
	CONFIG_KEY_PLUGIN_STATE,
	create(PluginStateSchema, {
		schemaVersion: getConfigDocumentCurrentVersion(CONFIG_KEY_PLUGIN_STATE),
		plugins: [],
	}),
);

export const recentlyAddedStateRepository =
	new ConfigRepositoryFile<RecentlyAddedState>(
		DB_FILE_RECENTLY_ADDED_STATE,
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
		}),
	);

export const savedSearchRepository = new ConfigRepositoryFile<SavedSearches>(
	DB_FILE_SAVED_SEARCHES,
	SavedSearchesSchema,
	CONFIG_KEY_SAVED_SEARCHES,
	create(SavedSearchesSchema, {
		schemaVersion: getConfigDocumentCurrentVersion(CONFIG_KEY_SAVED_SEARCHES),
		searches: [],
	}),
);
