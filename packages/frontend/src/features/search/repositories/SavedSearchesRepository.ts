import type { SavedSearches } from "@sola_mpd/shared/src/models/search_pb.js";
import type { StateRepository } from "../../common/repositories/StateRepository";

export type SavedSearchesRepository = StateRepository<SavedSearches>;
