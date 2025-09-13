import type {
	AdvancedSearchRequest,
	AdvancedSearchResponse,
} from "@sola_mpd/domain/src/models/advanced_search_pb.js";

/**
 * Interface for advanced search client.
 */
export interface AdvancedSearchClient {
	/**
	 * Sends a command to the advanced search service.
	 * @param req The advanced search request
	 * @returns Promise resolving to the advanced search response
	 */
	command: (req: AdvancedSearchRequest) => Promise<AdvancedSearchResponse>;
}
