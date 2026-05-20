import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";

export type LibraryGroupableTag =
	| "artist"
	| "album_artist"
	| "album"
	| "genre"
	| "composer"
	| "label";

export type LibraryAggregationRow = {
	value: string;
	song_count: number;
	duration_seconds: number;
};

export type LibraryFormatRow = {
	format: string;
	song_count: number;
	duration_seconds: number;
};

export type LibraryDecadeRow = {
	decade: string;
	song_count: number;
	duration_seconds: number;
};

export type LibraryRecentlyAddedRow = {
	artist: string;
	last_added: string;
	first_added: string;
	song_count: number;
};

export type LibraryArtistSummary = {
	name: string;
	song_count: number;
	album_count: number;
	duration_seconds: number;
	first_added: string | undefined;
	last_added: string | undefined;
	earliest_release: string | undefined;
	latest_release: string | undefined;
	genres: string[];
	formats: string[];
};

export type LibrarySqlResult = {
	columns: string[];
	rows: unknown[][];
	row_count: number;
	truncated: boolean;
};

export type LibraryIndexStats = {
	song_count: number;
	last_built_at: string | undefined;
	last_source_signature: string | undefined;
};

/**
 * Read-side analytical projection over the MPD library. Implementations are
 * expected to mirror the songs supplied to `refreshIfNeeded` and answer the
 * aggregate / SQL questions below without round-tripping to MPD.
 */
export interface LibraryIndex {
	/** Rebuilds the mirror if the supplied song list is a new reference. */
	refreshIfNeeded(songs: Song[]): boolean;

	stats(): LibraryIndexStats;

	topByTag(
		tag: LibraryGroupableTag,
		by: "count" | "duration",
		limit: number,
	): LibraryAggregationRow[];

	breakdown(tag: LibraryGroupableTag, limit?: number): LibraryAggregationRow[];

	formatDistribution(): LibraryFormatRow[];

	decadeBreakdown(): LibraryDecadeRow[];

	recentlyAddedByArtist(opts: {
		limit: number;
		since?: Date;
	}): LibraryRecentlyAddedRow[];

	artistSummary(name: string): LibraryArtistSummary | undefined;

	querySql(sql: string, params: unknown[], rowLimit: number): LibrarySqlResult;

	/** Human-readable schema for use in tool descriptions. */
	describe(): { sql_schema: string; notes: string };

	close(): void;
}
