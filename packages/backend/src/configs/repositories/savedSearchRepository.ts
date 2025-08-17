import { create } from "@bufbuild/protobuf";
import { DB_FILE_SAVED_SEARCHES } from "@sola_mpd/domain/src/const/database.js";
import {
	type SavedSearches,
	SavedSearchesSchema,
} from "@sola_mpd/domain/src/models/search_pb.js";

import { FileRepository } from "./FileRepository.js";

export const savedSearchRepository = new FileRepository<SavedSearches>(
	DB_FILE_SAVED_SEARCHES,
	SavedSearchesSchema,
	create(SavedSearchesSchema, {
		searches: [],
	}),
);
