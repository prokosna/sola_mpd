import { create } from "@bufbuild/protobuf";
import {
	FloatValueSchema,
	Int32ValueSchema,
	StringValueSchema,
	type Timestamp,
	timestampDate,
	timestampFromDate,
} from "@bufbuild/protobuf/wkt";
import dayjs from "dayjs";
import { describe, expect, it } from "vitest";

import {
	AudioFormat_Encoding,
	AudioFormatSchema,
	Song_MetadataTag,
	Song_MetadataValueSchema,
	SongSchema,
} from "../models/song_pb.js";

import {
	convertAudioFormatToString,
	convertSongMetadataValueToString,
	convertStringToSongMetadataValue,
	getSongMetadataAsNumber,
	getSongMetadataAsString,
	listAllSongMetadataTags,
} from "./songUtils.js";

describe("SongUtils", () => {
	it("getSongMetadataAsString should return correct string value", () => {
		const song = create(SongSchema, {
			metadata: {
				[Song_MetadataTag.TITLE]: create(Song_MetadataValueSchema, {
					value: {
						case: "stringValue",
						value: create(StringValueSchema, { value: "Test Song" }),
					},
				}),
			},
		});
		expect(getSongMetadataAsString(song, Song_MetadataTag.TITLE)).toBe(
			"Test Song",
		);
	});

	it("getSongMetadataAsNumber should return correct number value", () => {
		const song = create(SongSchema, {
			metadata: {
				[Song_MetadataTag.DURATION]: create(Song_MetadataValueSchema, {
					value: {
						case: "intValue",
						value: create(Int32ValueSchema, { value: 120 }),
					},
				}),
			},
		});
		expect(getSongMetadataAsNumber(song, Song_MetadataTag.DURATION)).toBe(120);
	});

	it("getSongMetadataAsNumber should handle different value types", () => {
		const song = create(SongSchema, {
			metadata: {
				[Song_MetadataTag.TRACK]: create(Song_MetadataValueSchema, {
					value: {
						case: "stringValue",
						value: create(StringValueSchema, { value: "42" }),
					},
				}),
				[Song_MetadataTag.DURATION]: create(Song_MetadataValueSchema, {
					value: {
						case: "floatValue",
						value: create(FloatValueSchema, { value: 120.5 }),
					},
				}),
				[Song_MetadataTag.UPDATED_AT]: create(Song_MetadataValueSchema, {
					value: {
						case: "timestamp",
						value: timestampFromDate(new Date("2020-01-01")),
					},
				}),
				[Song_MetadataTag.FORMAT]: create(Song_MetadataValueSchema, {
					value: {
						case: "format",
						value: create(AudioFormatSchema, {
							encoding: AudioFormat_Encoding.PCM,
							channels: 2,
							bits: 16,
							samplingRate: 44100,
						}),
					},
				}),
			},
		});

		expect(getSongMetadataAsNumber(song, Song_MetadataTag.TRACK)).toBe(42);
		expect(getSongMetadataAsNumber(song, Song_MetadataTag.DURATION)).toBe(
			120.5,
		);
		expect(getSongMetadataAsNumber(song, Song_MetadataTag.UPDATED_AT)).toBe(
			new Date("2020-01-01").getTime(),
		);
		expect(getSongMetadataAsNumber(song, Song_MetadataTag.FORMAT)).toBe(44100);
	});

	it("convertStringToSongMetadataValue should handle different types of values", () => {
		expect(convertStringToSongMetadataValue("42").value).toEqual({
			case: "intValue",
			value: create(Int32ValueSchema, { value: 42 }),
		});
		expect(convertStringToSongMetadataValue("42.5").value).toEqual({
			case: "floatValue",
			value: create(FloatValueSchema, { value: 42.5 }),
		});
		expect(convertStringToSongMetadataValue("Test").value).toEqual({
			case: "stringValue",
			value: create(StringValueSchema, { value: "Test" }),
		});
	});

	it("convertStringToSongMetadataValue should handle empty and date strings", () => {
		const emptyValue = convertStringToSongMetadataValue("");
		expect(emptyValue.value).toEqual({
			case: "stringValue",
			value: create(StringValueSchema, { value: "" }),
		});

		const dateValue = convertStringToSongMetadataValue("2020-01-01");
		expect(dateValue.value.case).toBe("timestamp");
		expect(timestampDate(dateValue.value.value as Timestamp)).toEqual(
			dayjs("2020-01-01").toDate(),
		);
	});

	it("convertSongMetadataValueToString should return correct string representation", () => {
		const stringValue = create(Song_MetadataValueSchema, {
			value: {
				case: "stringValue",
				value: create(StringValueSchema, { value: "Test" }),
			},
		});
		expect(convertSongMetadataValueToString(stringValue)).toBe("Test");

		const dateValue = create(Song_MetadataValueSchema, {
			value: {
				case: "timestamp",
				value: timestampFromDate(new Date("2020-01-01")),
			},
		});
		expect(convertSongMetadataValueToString(dateValue)).toBe("2020-01-01");
	});

	it("convertSongMetadataValueToString should handle all value types", () => {
		const floatValue = create(Song_MetadataValueSchema, {
			value: {
				case: "floatValue",
				value: create(FloatValueSchema, { value: 42.5 }),
			},
		});
		expect(convertSongMetadataValueToString(floatValue)).toBe("42.5");

		const intValue = create(Song_MetadataValueSchema, {
			value: {
				case: "intValue",
				value: create(Int32ValueSchema, { value: 42 }),
			},
		});
		expect(convertSongMetadataValueToString(intValue)).toBe("42");

		const emptyStringValue = create(Song_MetadataValueSchema, {
			value: {
				case: "stringValue",
				value: create(StringValueSchema, { value: "" }),
			},
		});
		expect(convertSongMetadataValueToString(emptyStringValue)).toBe("");

		const formatValue = create(Song_MetadataValueSchema, {
			value: {
				case: "format",
				value: create(AudioFormatSchema, {
					encoding: AudioFormat_Encoding.PCM,
					channels: 2,
					bits: 16,
					samplingRate: 44100,
				}),
			},
		});
		expect(convertSongMetadataValueToString(formatValue)).toBe(
			"PCM: 2ch 16bit 44100Hz",
		);
	});

	it("convertAudioFormatToString should format audio format correctly", () => {
		const format = create(AudioFormatSchema, {
			encoding: AudioFormat_Encoding.PCM,
			channels: 2,
			bits: 16,
			samplingRate: 44100,
		});
		expect(convertAudioFormatToString(format)).toBe("PCM: 2ch 16bit 44100Hz");
	});

	it("convertAudioFormatToString should handle different encoding types", () => {
		const formats = [
			{
				encoding: AudioFormat_Encoding.PCM,
				expected: "PCM: 2ch 16bit 44100Hz",
			},
			{
				encoding: AudioFormat_Encoding.DSD,
				expected: "DSD: 2ch 16bit 44100Hz",
			},
		];

		for (const { encoding, expected } of formats) {
			const format = create(AudioFormatSchema, {
				encoding,
				channels: 2,
				bits: 16,
				samplingRate: 44100,
			});
			expect(convertAudioFormatToString(format)).toBe(expected);
		}
	});

	it("listAllSongMetadataTags should list all metadata tags except UNKNOWN", () => {
		const tags = listAllSongMetadataTags();
		expect(tags).toBeInstanceOf(Array);
		expect(tags).not.toContain(Song_MetadataTag.UNKNOWN);
		expect(tags).toContain(Song_MetadataTag.ALBUM_ARTIST);
	});
});
