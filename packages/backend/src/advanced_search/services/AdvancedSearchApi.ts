import type {
	AdvancedSearchCommand_SimilarityType,
	AdvancedSearchCommand_TextToMusicType,
	AdvancedSearchStats,
} from "@sola_mpd/shared/src/models/advanced_search_pb.js";

export type SearchTextToMusicInput = {
	endpoint: string;
	query: string;
	textToMusicType: AdvancedSearchCommand_TextToMusicType;
	limit: number;
};

export type SearchSimilarSongsInput = {
	endpoint: string;
	songPath: string;
	similarityType: AdvancedSearchCommand_SimilarityType;
	limit: number;
};

export type SearchSimilarSongsResult =
	| {
			kind: "songs";
			filePaths: string[];
	  }
	| {
			kind: "error";
			message: string;
	  };

export interface AdvancedSearchApi {
	fetchStats: (endpoint: string) => Promise<AdvancedSearchStats>;
	searchTextToMusic: (input: SearchTextToMusicInput) => Promise<string[]>;
	searchSimilarSongs: (
		input: SearchSimilarSongsInput,
	) => Promise<SearchSimilarSongsResult>;
	scanLibrary: (endpoint: string) => Promise<void>;
	vacuumLibrary: (endpoint: string) => Promise<void>;
	analyze: (endpoint: string) => Promise<void>;
}
