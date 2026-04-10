import type {
	AdvancedSearchRequest,
	AdvancedSearchResponse,
} from "@sola_mpd/shared/src/models/advanced_search_pb.js";

export interface AdvancedSearchClient {
	command: (req: AdvancedSearchRequest) => Promise<AdvancedSearchResponse>;
}
