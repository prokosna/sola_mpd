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

import { songToOutput } from "./songToOutput.js";

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

function makeSong(): Song {
	const song = create(SongSchema, { path: "music/foo.flac" });
	song.metadata[Song_MetadataTag.TITLE] = stringMetadata("Title");
	song.metadata[Song_MetadataTag.ARTIST] = stringMetadata("Artist");
	song.metadata[Song_MetadataTag.ALBUM_ARTIST] = stringMetadata("Album Artist");
	song.metadata[Song_MetadataTag.ALBUM] = stringMetadata("Album");
	song.metadata[Song_MetadataTag.GENRE] = stringMetadata("Electronic");
	song.metadata[Song_MetadataTag.COMPOSER] = stringMetadata("Composer");
	song.metadata[Song_MetadataTag.LABEL] = stringMetadata("Label");
	song.metadata[Song_MetadataTag.COMMENT] = stringMetadata("Comment");
	song.metadata[Song_MetadataTag.DATE] = stringMetadata("2024-03-15");
	song.metadata[Song_MetadataTag.TRACK] = floatMetadata(7);
	song.metadata[Song_MetadataTag.DISC] = floatMetadata(2);
	song.metadata[Song_MetadataTag.DURATION] = floatMetadata(123.456);
	song.metadata[Song_MetadataTag.FORMAT] = formatMetadata();
	song.metadata[Song_MetadataTag.ADDED_AT] = timestampMetadata(
		new Date("2025-01-02T03:04:05Z"),
	);
	song.metadata[Song_MetadataTag.UPDATED_AT] = timestampMetadata(
		new Date("2025-02-03T04:05:06Z"),
	);
	return song;
}

describe("songToOutput", () => {
	it("flattens metadata into LLM-friendly output", () => {
		const out = songToOutput(makeSong());
		expect(out.path).toBe("music/foo.flac");
		expect(out.title).toBe("Title");
		expect(out.artist).toBe("Artist");
		expect(out.album_artist).toBe("Album Artist");
		expect(out.album).toBe("Album");
		expect(out.genre).toBe("Electronic");
		expect(out.composer).toBe("Composer");
		expect(out.label).toBe("Label");
		expect(out.comment).toBe("Comment");
		expect(out.date).toBe("2024-03-15");
		expect(out.track).toBe(7);
		expect(out.disc).toBe(2);
		expect(out.duration_seconds).toBeCloseTo(123.456);
		expect(out.format).toContain("44100");
		expect(out.added_at).toBe("2025-01-02T03:04:05.000Z");
		expect(out.updated_at).toBe("2025-02-03T04:05:06.000Z");
	});

	it("returns null for numeric tags that are missing", () => {
		const song = makeSong();
		delete song.metadata[Song_MetadataTag.TRACK];
		delete song.metadata[Song_MetadataTag.DISC];
		delete song.metadata[Song_MetadataTag.DURATION];
		const out = songToOutput(song);
		expect(out.track).toBeNull();
		expect(out.disc).toBeNull();
		expect(out.duration_seconds).toBeNull();
	});

	it("returns null for timestamp tags that are missing", () => {
		const song = makeSong();
		delete song.metadata[Song_MetadataTag.ADDED_AT];
		delete song.metadata[Song_MetadataTag.UPDATED_AT];
		const out = songToOutput(song);
		expect(out.added_at).toBeNull();
		expect(out.updated_at).toBeNull();
	});

	it("returns empty strings for missing string-valued tags", () => {
		const song = create(SongSchema, { path: "music/bar.mp3" });
		const out = songToOutput(song);
		expect(out.title).toBe("");
		expect(out.artist).toBe("");
		expect(out.album_artist).toBe("");
		expect(out.album).toBe("");
		expect(out.genre).toBe("");
		expect(out.composer).toBe("");
		expect(out.label).toBe("");
		expect(out.comment).toBe("");
		expect(out.date).toBe("");
		expect(out.format).toBe("");
	});

	it("returns empty format when AudioFormat is unset", () => {
		const song = makeSong();
		song.metadata[Song_MetadataTag.FORMAT] = create(Song_MetadataValueSchema, {
			value: { case: "format", value: create(AudioFormatSchema) },
		});
		expect(songToOutput(song).format).toBe("");
	});
});
