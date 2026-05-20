import { create } from "@bufbuild/protobuf";
import {
	FloatValueSchema,
	StringValueSchema,
	timestampFromDate,
} from "@bufbuild/protobuf/wkt";
import {
	AudioFormat_Encoding,
	AudioFormatSchema,
	type Song,
	Song_MetadataTag,
	Song_MetadataValueSchema,
	SongSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import { songToRow } from "./songToRow.js";

function stringMetadata(value: string) {
	return create(Song_MetadataValueSchema, {
		value: {
			case: "stringValue",
			value: create(StringValueSchema, { value }),
		},
	});
}

function floatMetadata(value: number) {
	return create(Song_MetadataValueSchema, {
		value: {
			case: "floatValue",
			value: create(FloatValueSchema, { value }),
		},
	});
}

function timestampMetadata(date: Date) {
	return create(Song_MetadataValueSchema, {
		value: { case: "timestamp", value: timestampFromDate(date) },
	});
}

function formatMetadata() {
	return create(Song_MetadataValueSchema, {
		value: {
			case: "format",
			value: create(AudioFormatSchema, {
				encoding: AudioFormat_Encoding.PCM,
				samplingRate: 44100,
				bits: 16,
				channels: 2,
			}),
		},
	});
}

function makeSong(overrides: Partial<Song["metadata"]> = {}): Song {
	const song = create(SongSchema, { path: "music/foo.flac" });
	song.metadata[Song_MetadataTag.TITLE] = stringMetadata("Title");
	song.metadata[Song_MetadataTag.ARTIST] = stringMetadata("Artist");
	song.metadata[Song_MetadataTag.ALBUM_ARTIST] = stringMetadata("Album Artist");
	song.metadata[Song_MetadataTag.ALBUM] = stringMetadata("Album");
	song.metadata[Song_MetadataTag.GENRE] = stringMetadata("Electronic");
	song.metadata[Song_MetadataTag.COMPOSER] = stringMetadata("");
	song.metadata[Song_MetadataTag.LABEL] = stringMetadata("");
	song.metadata[Song_MetadataTag.DATE] = stringMetadata("2024-03-15");
	song.metadata[Song_MetadataTag.DURATION] = floatMetadata(123.456);
	song.metadata[Song_MetadataTag.FORMAT] = formatMetadata();
	song.metadata[Song_MetadataTag.ADDED_AT] = timestampMetadata(
		new Date("2025-01-02T03:04:05Z"),
	);
	song.metadata[Song_MetadataTag.UPDATED_AT] = timestampMetadata(
		new Date("2025-01-02T03:04:05Z"),
	);
	Object.assign(song.metadata, overrides);
	return song;
}

describe("songToRow", () => {
	it("flattens metadata into row fields", () => {
		const row = songToRow(makeSong());
		expect(row.path).toBe("music/foo.flac");
		expect(row.title).toBe("Title");
		expect(row.artist).toBe("Artist");
		expect(row.album_artist).toBe("Album Artist");
		expect(row.album).toBe("Album");
		expect(row.genre).toBe("Electronic");
		expect(row.date).toBe("2024-03-15");
		expect(row.year).toBe(2024);
		expect(row.duration_seconds).toBeCloseTo(123.456);
		expect(row.format).toContain("44100");
		expect(row.added_at_ms).toBe(new Date("2025-01-02T03:04:05Z").getTime());
		expect(row.updated_at_ms).toBe(new Date("2025-01-02T03:04:05Z").getTime());
	});

	it("returns null for missing duration / timestamp tags", () => {
		const song = makeSong();
		delete song.metadata[Song_MetadataTag.DURATION];
		delete song.metadata[Song_MetadataTag.ADDED_AT];
		const row = songToRow(song);
		expect(row.duration_seconds).toBeNull();
		expect(row.added_at_ms).toBeNull();
	});

	it("parses leading 4-digit year from DATE", () => {
		expect(songToRow(makeSong({})).year).toBe(2024);
		const songWithYearOnly = makeSong();
		songWithYearOnly.metadata[Song_MetadataTag.DATE] = stringMetadata("1999");
		expect(songToRow(songWithYearOnly).year).toBe(1999);
		const songWithJunk = makeSong();
		songWithJunk.metadata[Song_MetadataTag.DATE] = stringMetadata("unknown");
		expect(songToRow(songWithJunk).year).toBeNull();
	});

	it("treats negative epoch timestamps as null", () => {
		const song = makeSong();
		song.metadata[Song_MetadataTag.ADDED_AT] = timestampMetadata(new Date(-1));
		expect(songToRow(song).added_at_ms).toBeNull();
	});

	it("returns empty format string when AudioFormat is unset", () => {
		const song = makeSong();
		song.metadata[Song_MetadataTag.FORMAT] = create(Song_MetadataValueSchema, {
			value: { case: "format", value: create(AudioFormatSchema) },
		});
		expect(songToRow(song).format).toBe("");
	});
});
