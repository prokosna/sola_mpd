import { create } from "@bufbuild/protobuf";
import { DB_FILE_BROWSER_STATE } from "@sola_mpd/domain/src/const/database.js";
import {
	BrowserFilterSchema,
	type BrowserState,
	BrowserStateSchema,
} from "@sola_mpd/domain/src/models/browser_pb.js";
import { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";

import { FileRepository } from "./FileRepository.js";

export const browserStateRepository = new FileRepository<BrowserState>(
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
