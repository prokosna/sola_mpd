import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import Database from "better-sqlite3";

import { songToRow } from "../functions/songToRow.js";
import type {
	LibraryAggregated,
	LibraryAggregationRow,
	LibraryArtistSummary,
	LibraryDecadeRow,
	LibraryFormatRow,
	LibraryGroupableTag,
	LibraryIndex,
	LibraryIndexStats,
	LibraryRecentlyAddedRow,
	LibrarySqlResult,
} from "./LibraryIndex.js";

const TAG_COLUMN: Record<LibraryGroupableTag, string> = {
	artist: "artist",
	album_artist: "album_artist",
	album: "album",
	genre: "genre",
	composer: "composer",
	label: "label",
};

const SCHEMA_DESCRIPTION = `CREATE TABLE songs (
  path TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  artist TEXT NOT NULL DEFAULT '',
  album_artist TEXT NOT NULL DEFAULT '',
  album TEXT NOT NULL DEFAULT '',
  genre TEXT NOT NULL DEFAULT '',
  composer TEXT NOT NULL DEFAULT '',
  label TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL DEFAULT '',         -- raw release-date string from MPD ("YYYY" or "YYYY-MM-DD")
  year INTEGER,                          -- parsed leading 4-digit year, NULL when missing
  format TEXT NOT NULL DEFAULT '',       -- e.g. "PCM: 2ch 16bits 44100Hz"
  duration_seconds REAL,                 -- NULL when MPD did not report a duration
  added_at_ms INTEGER,                   -- UNIX epoch ms; convert with datetime(added_at_ms/1000, 'unixepoch')
  updated_at_ms INTEGER                  -- file modified time
);`;

const SQL_NOTES = `Notes:
- All string columns use empty strings rather than NULL when MPD did not supply a value. Filter with "artist <> ''" to skip songs with no artist tag.
- Coalesce "NULLIF(album_artist, '')" with artist when grouping releases by act, since some libraries leave album_artist blank.
- Convert added_at_ms / updated_at_ms into ISO timestamps with datetime(added_at_ms/1000, 'unixepoch').
- The mirror is rebuilt from MPD's full song list each time the underlying cache changes; there is no historical data beyond what MPD itself stores.`;

class LibraryIndexSqlite implements LibraryIndex {
	private readonly db: Database.Database;
	private lastSongsRef: Song[] | undefined = undefined;
	private lastBuiltAt: Date | undefined = undefined;
	private lastSongCount = 0;
	private lastSignature: string | undefined = undefined;

	private readonly insertStmt: Database.Statement;
	private readonly deleteAllStmt: Database.Statement;
	private readonly bulkInsert: (rows: ReturnType<typeof songToRow>[]) => void;

	constructor() {
		this.db = new Database(":memory:");
		this.db.pragma("journal_mode = MEMORY");
		this.db.pragma("synchronous = OFF");
		this.db.exec(SCHEMA_DESCRIPTION);
		this.db.exec(
			"CREATE INDEX songs_artist_idx ON songs(artist);" +
				"CREATE INDEX songs_album_artist_idx ON songs(album_artist);" +
				"CREATE INDEX songs_album_idx ON songs(album);" +
				"CREATE INDEX songs_genre_idx ON songs(genre);" +
				"CREATE INDEX songs_year_idx ON songs(year);" +
				"CREATE INDEX songs_added_at_idx ON songs(added_at_ms);",
		);

		this.insertStmt = this.db.prepare(
			`INSERT INTO songs (path, title, artist, album_artist, album, genre, composer, label, date, year, format, duration_seconds, added_at_ms, updated_at_ms)
       VALUES (@path, @title, @artist, @album_artist, @album, @genre, @composer, @label, @date, @year, @format, @duration_seconds, @added_at_ms, @updated_at_ms)`,
		);
		this.deleteAllStmt = this.db.prepare("DELETE FROM songs");

		this.bulkInsert = this.db.transaction(
			(rows: ReturnType<typeof songToRow>[]) => {
				this.deleteAllStmt.run();
				for (const row of rows) {
					this.insertStmt.run(row);
				}
			},
		);
	}

	refreshIfNeeded(songs: Song[]): boolean {
		if (songs === this.lastSongsRef) {
			return false;
		}
		const rows = songs.map(songToRow);
		this.bulkInsert(rows);
		this.lastSongsRef = songs;
		this.lastBuiltAt = new Date();
		this.lastSongCount = rows.length;
		this.lastSignature = `${rows.length}@${this.lastBuiltAt.toISOString()}`;
		return true;
	}

	stats(): LibraryIndexStats {
		return {
			song_count: this.lastSongCount,
			last_built_at: this.lastBuiltAt?.toISOString() ?? null,
			last_source_signature: this.lastSignature ?? null,
		};
	}

	topByTag(
		tag: LibraryGroupableTag,
		by: "count" | "duration",
		limit: number,
	): LibraryAggregated<LibraryAggregationRow> {
		const column = TAG_COLUMN[tag];
		const orderBy =
			by === "duration"
				? "duration_seconds DESC, song_count DESC"
				: "song_count DESC, duration_seconds DESC";
		const rows = this.db
			.prepare(
				`SELECT ${column} AS value,
                COUNT(*) AS song_count,
                COALESCE(SUM(duration_seconds), 0) AS duration_seconds
       FROM songs
       WHERE ${column} <> ''
       GROUP BY ${column}
       ORDER BY ${orderBy}
       LIMIT ?`,
			)
			.all(limit) as LibraryAggregationRow[];
		const distinct = this.db
			.prepare(
				`SELECT COUNT(DISTINCT ${column}) AS n FROM songs WHERE ${column} <> ''`,
			)
			.get() as { n: number };
		return { rows, distinct_values_seen: distinct.n };
	}

	breakdown(
		tag: LibraryGroupableTag,
		limit?: number,
	): LibraryAggregated<LibraryAggregationRow> {
		const column = TAG_COLUMN[tag];
		const sql = `SELECT ${column} AS value,
                COUNT(*) AS song_count,
                COALESCE(SUM(duration_seconds), 0) AS duration_seconds
       FROM songs
       GROUP BY ${column}
       ORDER BY song_count DESC, value ASC
       ${limit !== undefined ? "LIMIT ?" : ""}`;
		const stmt = this.db.prepare(sql);
		const rows = (
			limit !== undefined ? stmt.all(limit) : stmt.all()
		) as LibraryAggregationRow[];
		const distinct = this.db
			.prepare(`SELECT COUNT(DISTINCT ${column}) AS n FROM songs`)
			.get() as { n: number };
		return { rows, distinct_values_seen: distinct.n };
	}

	formatDistribution(): LibraryAggregated<LibraryFormatRow> {
		const sql = `SELECT
       CASE WHEN format = '' THEN '(unknown)' ELSE format END AS format,
       COUNT(*) AS song_count,
       COALESCE(SUM(duration_seconds), 0) AS duration_seconds
       FROM songs
       GROUP BY format
       ORDER BY song_count DESC`;
		const rows = this.db.prepare(sql).all() as LibraryFormatRow[];
		// Full enumeration: distinct count is exactly rows.length. The field is
		// reported anyway so the agent can pattern-match the same envelope shape
		// across every aggregation tool.
		return { rows, distinct_values_seen: rows.length };
	}

	decadeBreakdown(): LibraryAggregated<LibraryDecadeRow> {
		// Treat clearly bogus years (sentinel values like "9999", typos) as
		// unknown rather than letting them create spurious decade buckets.
		const sql = `SELECT
         CASE WHEN year IS NULL OR year < 1000 OR year > 2100 THEN '(unknown)'
              ELSE printf('%ds', (year / 10) * 10)
         END AS decade,
         COUNT(*) AS song_count,
         COALESCE(SUM(duration_seconds), 0) AS duration_seconds
       FROM songs
       GROUP BY decade
       ORDER BY CASE WHEN decade = '(unknown)' THEN 1 ELSE 0 END, decade ASC`;
		const rows = this.db.prepare(sql).all() as LibraryDecadeRow[];
		return { rows, distinct_values_seen: rows.length };
	}

	recentlyAddedByArtist(opts: {
		limit: number;
		since?: Date;
	}): LibraryAggregated<LibraryRecentlyAddedRow> {
		const sinceMs = opts.since?.getTime() ?? null;
		const whereClause =
			sinceMs === null
				? "added_at_ms IS NOT NULL"
				: "added_at_ms IS NOT NULL AND added_at_ms >= ?";
		// GROUP BY must reference the same expression used in SELECT — a bare
		// `GROUP BY artist` would group by the `artist` *column* (per SQLite's
		// resolution rules) and yield duplicate rows whose alias value collides
		// (e.g. multiple "Various Artists" entries).
		const rowsSql = `SELECT
         COALESCE(NULLIF(album_artist, ''), artist) AS artist,
         datetime(MAX(added_at_ms)/1000, 'unixepoch') AS last_added,
         datetime(MIN(added_at_ms)/1000, 'unixepoch') AS first_added,
         COUNT(*) AS song_count
       FROM songs
       WHERE ${whereClause} AND (artist <> '' OR album_artist <> '')
       GROUP BY COALESCE(NULLIF(album_artist, ''), artist)
       ORDER BY MAX(added_at_ms) DESC
       LIMIT ?`;
		const distinctSql = `SELECT COUNT(DISTINCT COALESCE(NULLIF(album_artist, ''), artist)) AS n
       FROM songs
       WHERE ${whereClause} AND (artist <> '' OR album_artist <> '')`;
		const rowsParams = sinceMs === null ? [opts.limit] : [sinceMs, opts.limit];
		const distinctParams = sinceMs === null ? [] : [sinceMs];
		const rows = this.db
			.prepare(rowsSql)
			.all(...rowsParams) as LibraryRecentlyAddedRow[];
		const distinct = this.db.prepare(distinctSql).get(...distinctParams) as {
			n: number;
		};
		return { rows, distinct_values_seen: distinct.n };
	}

	artistSummary(name: string): LibraryArtistSummary | undefined {
		// SQLite returns SQL NULL as JavaScript `null`; the internal row type
		// reflects that. Normalize to `undefined` when we construct the
		// port-facing `LibraryArtistSummary`.
		const baseRow = this.db
			.prepare(
				`SELECT
           COUNT(*) AS song_count,
           COUNT(DISTINCT NULLIF(album, '')) AS album_count,
           COALESCE(SUM(duration_seconds), 0) AS duration_seconds,
           MIN(NULLIF(added_at_ms, 0)) AS first_added_ms,
           MAX(NULLIF(added_at_ms, 0)) AS last_added_ms,
           MIN(CASE WHEN year BETWEEN 1000 AND 2100 THEN year END) AS earliest_year,
           MAX(CASE WHEN year BETWEEN 1000 AND 2100 THEN year END) AS latest_year
         FROM songs
         WHERE artist = ? OR album_artist = ?`,
			)
			.get(name, name) as
			| {
					song_count: number;
					album_count: number;
					duration_seconds: number;
					first_added_ms: number | null;
					last_added_ms: number | null;
					earliest_year: number | null;
					latest_year: number | null;
			  }
			| undefined;

		if (baseRow === undefined || baseRow.song_count === 0) {
			return undefined;
		}

		const genres = (
			this.db
				.prepare(
					`SELECT DISTINCT genre FROM songs WHERE (artist = ? OR album_artist = ?) AND genre <> '' ORDER BY genre`,
				)
				.all(name, name) as { genre: string }[]
		).map((r) => r.genre);

		const formats = (
			this.db
				.prepare(
					`SELECT DISTINCT format FROM songs WHERE (artist = ? OR album_artist = ?) AND format <> '' ORDER BY format`,
				)
				.all(name, name) as { format: string }[]
		).map((r) => r.format);

		return {
			name,
			song_count: baseRow.song_count,
			album_count: baseRow.album_count,
			duration_seconds: baseRow.duration_seconds,
			first_added: msToIso(baseRow.first_added_ms),
			last_added: msToIso(baseRow.last_added_ms),
			earliest_release:
				baseRow.earliest_year !== null ? String(baseRow.earliest_year) : null,
			latest_release:
				baseRow.latest_year !== null ? String(baseRow.latest_year) : null,
			genres,
			formats,
		};
	}

	findArtistCandidates(name: string, limit: number): string[] {
		const direct = this.searchArtistLike(`%${name}%`, limit);
		if (direct.length > 0) {
			return direct;
		}
		// Fallback: take the longest alphanumeric token from the input and try
		// again. Handles cases like an HTML-escaped "Above &amp; Beyond" where
		// the entity breaks an exact substring match.
		const tokens = (name.match(/[\p{L}\p{N}]+/gu) ?? [])
			.filter((t) => t.length >= 3)
			.sort((a, b) => b.length - a.length);
		const longest = tokens[0];
		if (longest === undefined) {
			return [];
		}
		return this.searchArtistLike(`%${longest}%`, limit);
	}

	private searchArtistLike(pattern: string, limit: number): string[] {
		const rows = this.db
			.prepare(
				`WITH unified AS (
           SELECT DISTINCT artist AS name FROM songs WHERE artist <> ''
           UNION
           SELECT DISTINCT album_artist AS name FROM songs WHERE album_artist <> ''
         )
         SELECT name FROM unified
         WHERE name LIKE ? COLLATE NOCASE
         ORDER BY length(name) ASC, name ASC
         LIMIT ?`,
			)
			.all(pattern, limit) as { name: string }[];
		return rows.map((r) => r.name);
	}

	querySql(sql: string, params: unknown[], rowLimit: number): LibrarySqlResult {
		// `query_only` forces SQLite to reject INSERT/UPDATE/DELETE/DDL on this
		// connection, so even if a caller bypasses our parser checks the worst
		// they can do is read. Restore the writable state on the way out so the
		// next `refreshIfNeeded` can replace the table.
		this.db.pragma("query_only = ON");
		try {
			const stmt = this.db.prepare(sql);
			const columns = stmt.columns().map((c) => c.name);
			const rows: unknown[][] = [];
			let truncated = false;
			let count = 0;
			for (const raw of stmt.iterate(...params)) {
				if (count >= rowLimit) {
					truncated = true;
					break;
				}
				const obj = raw as Record<string, unknown>;
				rows.push(columns.map((col) => obj[col]));
				count++;
			}
			return {
				columns,
				rows,
				row_count: rows.length,
				truncated,
			};
		} finally {
			this.db.pragma("query_only = OFF");
		}
	}

	describe(): { sql_schema: string; notes: string } {
		return { sql_schema: SCHEMA_DESCRIPTION, notes: SQL_NOTES };
	}

	close(): void {
		if (this.db.open) {
			this.db.close();
		}
	}
}

function msToIso(ms: number | null): string | null {
	if (ms === null || !Number.isFinite(ms) || ms <= 0) {
		return null;
	}
	return new Date(ms).toISOString();
}

export const libraryIndexSqlite: LibraryIndex = new LibraryIndexSqlite();
