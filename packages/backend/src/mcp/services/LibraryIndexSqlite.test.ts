import { create } from "@bufbuild/protobuf";
import {
	FloatValueSchema,
	StringValueSchema,
	timestampFromDate,
} from "@bufbuild/protobuf/wkt";
import {
	type Song,
	Song_MetadataTag,
	Song_MetadataValueSchema,
	SongSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import { libraryIndexSqlite } from "./LibraryIndexSqlite.js";

function makeSong(input: {
	path: string;
	artist?: string;
	album_artist?: string;
	album?: string;
	genre?: string;
	year?: string;
	duration?: number;
	addedAt?: Date;
}): Song {
	const song = create(SongSchema, { path: input.path });
	const set = (tag: Song_MetadataTag, value: string) => {
		song.metadata[tag] = create(Song_MetadataValueSchema, {
			value: {
				case: "stringValue",
				value: create(StringValueSchema, { value }),
			},
		});
	};
	set(Song_MetadataTag.ARTIST, input.artist ?? "");
	set(Song_MetadataTag.ALBUM_ARTIST, input.album_artist ?? "");
	set(Song_MetadataTag.ALBUM, input.album ?? "");
	set(Song_MetadataTag.GENRE, input.genre ?? "");
	set(Song_MetadataTag.DATE, input.year ?? "");
	song.metadata[Song_MetadataTag.DURATION] = create(Song_MetadataValueSchema, {
		value: {
			case: "floatValue",
			value: create(FloatValueSchema, { value: input.duration ?? 0 }),
		},
	});
	if (input.addedAt !== undefined) {
		song.metadata[Song_MetadataTag.ADDED_AT] = create(
			Song_MetadataValueSchema,
			{
				value: { case: "timestamp", value: timestampFromDate(input.addedAt) },
			},
		);
	}
	return song;
}

describe("LibraryIndexSqlite", () => {
	it("supports the full analytical surface against a small dataset", () => {
		const songs: Song[] = [
			makeSong({
				path: "a/1.flac",
				artist: "Aphex Twin",
				album_artist: "Aphex Twin",
				album: "Selected Ambient Works 85-92",
				genre: "Electronic",
				year: "1992",
				duration: 300,
				addedAt: new Date("2020-01-01T00:00:00Z"),
			}),
			makeSong({
				path: "a/2.flac",
				artist: "Aphex Twin",
				album_artist: "Aphex Twin",
				album: "Selected Ambient Works 85-92",
				genre: "Electronic",
				year: "1992",
				duration: 250,
				addedAt: new Date("2020-01-01T00:00:00Z"),
			}),
			makeSong({
				path: "b/1.flac",
				artist: "Squarepusher",
				album_artist: "Squarepusher",
				album: "Dostrotime",
				genre: "Electronic",
				year: "2024",
				duration: 200,
				addedAt: new Date("2026-05-09T00:00:00Z"),
			}),
			makeSong({
				path: "c/1.flac",
				artist: "Berwald",
				album: "Symphony No. 3",
				genre: "Classical",
				year: "1845",
				duration: 1800,
			}),
		];

		libraryIndexSqlite.refreshIfNeeded(songs);
		expect(libraryIndexSqlite.stats().song_count).toBe(4);

		const topArtists = libraryIndexSqlite.topByTag("artist", "count", 10);
		expect(topArtists[0]).toMatchObject({ value: "Aphex Twin", song_count: 2 });

		const genres = libraryIndexSqlite.breakdown("genre");
		expect(genres.find((g) => g.value === "Electronic")?.song_count).toBe(3);
		expect(genres.find((g) => g.value === "Classical")?.song_count).toBe(1);

		const decades = libraryIndexSqlite.decadeBreakdown();
		expect(decades.find((d) => d.decade === "1990s")?.song_count).toBe(2);
		expect(decades.find((d) => d.decade === "2020s")?.song_count).toBe(1);
		expect(decades.find((d) => d.decade === "1840s")?.song_count).toBe(1);

		const recent = libraryIndexSqlite.recentlyAddedByArtist({ limit: 10 });
		expect(recent[0].artist).toBe("Squarepusher");
		expect(recent[0].song_count).toBe(1);

		const summary = libraryIndexSqlite.artistSummary("Aphex Twin");
		expect(summary).not.toBeNull();
		expect(summary?.song_count).toBe(2);
		expect(summary?.album_count).toBe(1);
		expect(summary?.genres).toEqual(["Electronic"]);
	});

	it("library_query_sql returns columns and rows, blocks writes", () => {
		const songs = [
			makeSong({
				path: "x/1.flac",
				artist: "Test",
				album: "A",
				duration: 60,
				addedAt: new Date("2025-01-01T00:00:00Z"),
			}),
		];
		libraryIndexSqlite.refreshIfNeeded(songs);

		const result = libraryIndexSqlite.querySql(
			"SELECT artist, COUNT(*) AS c FROM songs GROUP BY artist",
			[],
			10,
		);
		expect(result.columns).toEqual(["artist", "c"]);
		expect(result.row_count).toBeGreaterThan(0);

		// query_only blocks DML; better-sqlite3 surfaces this as a SqliteError.
		expect(() =>
			libraryIndexSqlite.querySql("DELETE FROM songs", [], 10),
		).toThrow();
	});

	it("row_limit truncates oversize result sets", () => {
		const songs = Array.from({ length: 50 }, (_, i) =>
			makeSong({ path: `p/${i}.flac`, artist: `Artist ${i}` }),
		);
		libraryIndexSqlite.refreshIfNeeded(songs);
		const result = libraryIndexSqlite.querySql(
			"SELECT path FROM songs",
			[],
			10,
		);
		expect(result.row_count).toBe(10);
		expect(result.truncated).toBe(true);
	});
});
