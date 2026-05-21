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
	first_added: string | null;
	last_added: string | null;
	earliest_release: string | null;
	latest_release: string | null;
	genres: string[];
	formats: string[];
};

export type LibrarySqlResult = {
	columns: string[];
	rows: unknown[][];
	row_count: number;
	truncated: boolean;
};

/**
 * Envelope used by every aggregation method. `distinct_values_seen` is the
 * total number of distinct group keys observed in the library *before* any
 * limit was applied, letting callers distinguish "no data" from "truncated"
 * and cross-check the mirror's coverage against `mpd_stats`.
 */
export type LibraryAggregated<Row> = {
	rows: Row[];
	distinct_values_seen: number;
};

export type LibraryIndexStats = {
	song_count: number;
	last_built_at: string | null;
	last_source_signature: string | null;
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
	): LibraryAggregated<LibraryAggregationRow>;

	breakdown(
		tag: LibraryGroupableTag,
		limit?: number,
	): LibraryAggregated<LibraryAggregationRow>;

	formatDistribution(): LibraryAggregated<LibraryFormatRow>;

	decadeBreakdown(): LibraryAggregated<LibraryDecadeRow>;

	recentlyAddedByArtist(opts: {
		limit: number;
		since?: Date;
	}): LibraryAggregated<LibraryRecentlyAddedRow>;

	artistSummary(name: string): LibraryArtistSummary | undefined;

	/**
	 * Returns artist / album_artist names that loosely match the query. Used by
	 * the artist_summary tool to suggest alternatives when an exact lookup misses
	 * (e.g. caller passed an HTML-escaped name).
	 */
	findArtistCandidates(name: string, limit: number): string[];

	querySql(sql: string, params: unknown[], rowLimit: number): LibrarySqlResult;

	/** Human-readable schema for use in tool descriptions. */
	describe(): { sql_schema: string; notes: string };

	close(): void;
}
