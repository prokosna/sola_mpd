import {
  StringValue,
  Int32Value,
  FloatValue,
  Timestamp,
} from "@bufbuild/protobuf";
import dayjs from "dayjs";
import { describe, it, expect } from "vitest";

import {
  Song,
  Song_MetadataTag,
  Song_MetadataValue,
  AudioFormat,
  AudioFormat_Encoding,
} from "../models/song_pb.js";

import {
  getSongMetadataAsString,
  getSongMetadataAsNumber,
  convertStringToSongMetadataValue,
  convertSongMetadataValueToString,
  convertAudioFormatToString,
  listAllSongMetadataTags,
} from "./songUtils.js";

describe("SongUtils", () => {
  it("getSongMetadataAsString should return correct string value", () => {
    const song = new Song({
      metadata: {
        [Song_MetadataTag.TITLE]: new Song_MetadataValue({
          value: {
            case: "stringValue",
            value: new StringValue({ value: "Test Song" }),
          },
        }),
      },
    });
    expect(getSongMetadataAsString(song, Song_MetadataTag.TITLE)).toBe(
      "Test Song",
    );
  });

  it("getSongMetadataAsNumber should return correct number value", () => {
    const song = new Song({
      metadata: {
        [Song_MetadataTag.DURATION]: new Song_MetadataValue({
          value: { case: "intValue", value: new Int32Value({ value: 120 }) },
        }),
      },
    });
    expect(getSongMetadataAsNumber(song, Song_MetadataTag.DURATION)).toBe(120);
  });

  it("getSongMetadataAsNumber should handle different value types", () => {
    const song = new Song({
      metadata: {
        [Song_MetadataTag.TRACK]: new Song_MetadataValue({
          value: {
            case: "stringValue",
            value: new StringValue({ value: "42" }),
          },
        }),
        [Song_MetadataTag.DURATION]: new Song_MetadataValue({
          value: {
            case: "floatValue",
            value: new FloatValue({ value: 120.5 }),
          },
        }),
        [Song_MetadataTag.UPDATED_AT]: new Song_MetadataValue({
          value: {
            case: "timestamp",
            value: Timestamp.fromDate(new Date("2020-01-01")),
          },
        }),
        [Song_MetadataTag.FORMAT]: new Song_MetadataValue({
          value: {
            case: "format",
            value: new AudioFormat({
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
      value: new Int32Value({ value: 42 }),
    });
    expect(convertStringToSongMetadataValue("42.5").value).toEqual({
      case: "floatValue",
      value: new FloatValue({ value: 42.5 }),
    });
    expect(convertStringToSongMetadataValue("Test").value).toEqual({
      case: "stringValue",
      value: new StringValue({ value: "Test" }),
    });
  });

  it("convertStringToSongMetadataValue should handle empty and date strings", () => {
    const emptyValue = convertStringToSongMetadataValue("");
    expect(emptyValue.value).toEqual({
      case: "stringValue",
      value: new StringValue({ value: "" }),
    });

    const dateValue = convertStringToSongMetadataValue("2020-01-01");
    expect(dateValue.value.case).toBe("timestamp");
    expect((dateValue.value.value as Timestamp).toDate()).toEqual(
      dayjs("2020-01-01").toDate(),
    );
  });

  it("convertSongMetadataValueToString should return correct string representation", () => {
    const stringValue = new Song_MetadataValue({
      value: { case: "stringValue", value: new StringValue({ value: "Test" }) },
    });
    expect(convertSongMetadataValueToString(stringValue)).toBe("Test");

    const dateValue = new Song_MetadataValue({
      value: {
        case: "timestamp",
        value: Timestamp.fromDate(new Date("2020-01-01")),
      },
    });
    expect(convertSongMetadataValueToString(dateValue)).toBe("2020-01-01");
  });

  it("convertSongMetadataValueToString should handle all value types", () => {
    const floatValue = new Song_MetadataValue({
      value: { case: "floatValue", value: new FloatValue({ value: 42.5 }) },
    });
    expect(convertSongMetadataValueToString(floatValue)).toBe("42.5");

    const intValue = new Song_MetadataValue({
      value: { case: "intValue", value: new Int32Value({ value: 42 }) },
    });
    expect(convertSongMetadataValueToString(intValue)).toBe("42");

    const emptyStringValue = new Song_MetadataValue({
      value: { case: "stringValue", value: new StringValue({ value: "" }) },
    });
    expect(convertSongMetadataValueToString(emptyStringValue)).toBe("");

    const formatValue = new Song_MetadataValue({
      value: {
        case: "format",
        value: new AudioFormat({
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
    const format = new AudioFormat({
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

    formats.forEach(({ encoding, expected }) => {
      const format = new AudioFormat({
        encoding,
        channels: 2,
        bits: 16,
        samplingRate: 44100,
      });
      expect(convertAudioFormatToString(format)).toBe(expected);
    });
  });

  it("listAllSongMetadataTags should list all metadata tags except UNKNOWN", () => {
    const tags = listAllSongMetadataTags();
    expect(tags).toBeInstanceOf(Array);
    expect(tags).not.toContain(Song_MetadataTag.UNKNOWN);
    expect(tags).toContain(Song_MetadataTag.ALBUM_ARTIST);
  });
});
