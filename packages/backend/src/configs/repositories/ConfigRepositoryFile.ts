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
	DB_FILE_BROWSER_STATE,
	DB_FILE_COMMON_SONG_TABLE_STATE,
	DB_FILE_MPD_PROFILE_STATE,
	DB_FILE_PLUGIN_STATE,
	DB_FILE_RECENTLY_ADDED_STATE,
	DB_FILE_SAVED_SEARCHES,
} from "@sola_mpd/shared/src/const/database.js";
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

import type { ConfigRepository } from "./ConfigRepository.js";

class ConfigRepositoryFile<T extends Message> implements ConfigRepository<T> {
	private localCache: T;

	constructor(
		private localFilePath: string,
		private schema: GenMessage<T>,
		defaultValue: T,
	) {
		this.localFilePath = localFilePath;
		const dirPath = path.dirname(this.localFilePath);
		try {
			fs.mkdirSync(dirPath, { recursive: true });
			const fileContent = fs.readFileSync(this.localFilePath, "utf-8");

			// Make sure that the local cache has all the latest necessary fields.
			// Otherwise, copy the field from the default value.
			const defaultValueJson = toJson(schema, defaultValue);
			const fileContentJson = JSON.parse(fileContent);
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
		fs.writeFileSync(
			this.localFilePath,
			JSON.stringify(toJson(this.schema, this.localCache), null, 2),
		);
	}
}

export const browserStateRepository = new ConfigRepositoryFile<BrowserState>(
	DB_FILE_BROWSER_STATE,
	BrowserStateSchema,
	create(BrowserStateSchema, {
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
		create(SongTableStateSchema, {
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
		create(MpdProfileStateSchema, {
			profiles: [],
		}),
	);

export const pluginStateRepository = new ConfigRepositoryFile<PluginState>(
	DB_FILE_PLUGIN_STATE,
	PluginStateSchema,
	create(PluginStateSchema, {
		plugins: [],
	}),
);

export const recentlyAddedStateRepository =
	new ConfigRepositoryFile<RecentlyAddedState>(
		DB_FILE_RECENTLY_ADDED_STATE,
		RecentlyAddedStateSchema,
		create(RecentlyAddedStateSchema, {
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
	create(SavedSearchesSchema, {
		searches: [],
	}),
);
