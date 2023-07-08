import { FileRepository } from "./FileRepository";

import { DB_FILE_SAVED_SEARCHES } from "@/const";
import { SavedSearches } from "@/models/search";

export const savedSearchRepository = new FileRepository<SavedSearches>(
  DB_FILE_SAVED_SEARCHES,
  SavedSearches.create({
    searches: [],
  }),
  SavedSearches,
);
