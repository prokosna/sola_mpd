import { create } from "@bufbuild/protobuf";
import { DB_FILE_RECENTLY_ADDED_STATE } from "@sola_mpd/domain/src/const/database.js";
import {
	RecentlyAddedFilterSchema,
	type RecentlyAddedState,
	RecentlyAddedStateSchema,
} from "@sola_mpd/domain/src/models/recently_added_pb.js";
import { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";

import { FileRepository } from "./FileRepository.js";

export const recentlyAddedStateRepository =
	new FileRepository<RecentlyAddedState>(
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
