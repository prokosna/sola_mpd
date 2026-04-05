import { create } from "@bufbuild/protobuf";
import { DB_FILE_RECENTLY_ADDED_STATE } from "@sola_mpd/shared/src/const/database.js";
import {
	RecentlyAddedFilterSchema,
	type RecentlyAddedState,
	RecentlyAddedStateSchema,
} from "@sola_mpd/shared/src/models/recently_added_pb.js";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";

import { ConfigRepositoryFile } from "./ConfigRepositoryFile.js";

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
