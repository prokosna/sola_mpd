import { fromBinary, toBinary } from "@bufbuild/protobuf";
import { API_CONFIGS_SAVED_SEARCHES } from "@sola_mpd/shared/src/const/api.js";
import {
	type SavedSearches,
	SavedSearchesSchema,
} from "@sola_mpd/shared/src/models/search_pb.js";
import type { HttpClient } from "../../../lib/http/HttpClient";
import type { SavedSearchesRepository } from "./SavedSearchesRepository";

export class SavedSearchesRepositoryHttp implements SavedSearchesRepository {
	constructor(private readonly client: HttpClient) {}

	fetch = async (): Promise<SavedSearches> => {
		return this.client.get<SavedSearches>(API_CONFIGS_SAVED_SEARCHES, (bytes) =>
			fromBinary(SavedSearchesSchema, bytes),
		);
	};

	save = async (savedSearches: SavedSearches): Promise<void> => {
		return this.client.post(
			API_CONFIGS_SAVED_SEARCHES,
			toBinary(SavedSearchesSchema, savedSearches),
		);
	};
}
