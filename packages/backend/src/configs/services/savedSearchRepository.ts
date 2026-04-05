import { create } from "@bufbuild/protobuf";
import { DB_FILE_SAVED_SEARCHES } from "@sola_mpd/shared/src/const/database.js";
import {
	type SavedSearches,
	SavedSearchesSchema,
} from "@sola_mpd/shared/src/models/search_pb.js";

import { ConfigRepositoryFile } from "./ConfigRepositoryFile.js";

export const savedSearchRepository = new ConfigRepositoryFile<SavedSearches>(
	DB_FILE_SAVED_SEARCHES,
	SavedSearchesSchema,
	create(SavedSearchesSchema, {
		searches: [],
	}),
);
