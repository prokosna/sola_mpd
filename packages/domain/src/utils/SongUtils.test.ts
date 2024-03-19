import {
  StringValue,
  Int32Value,
  FloatValue,
  Timestamp,
} from "@bufbuild/protobuf";
import { describe, it, expect } from "vitest";

import {
  Song,
  Song_MetadataTag,
  Song_MetadataValue,
  AudioFormat,
  AudioFormat_Encoding,
} from "../models/song_pb.js";

import { SongUtils } from "./SongUtils.js";

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
    expect(
      SongUtils.getSongMetadataAsString(song, Song_MetadataTag.TITLE),
    ).toBe("Test Song");
  });

  it("getSongMetadataAsNumber should return correct number value", () => {
    const song = new Song({
      metadata: {
        [Song_MetadataTag.DURATION]: new Song_MetadataValue({
          value: { case: "intValue", value: new Int32Value({ value: 120 }) },
        }),
      },
    });
    expect(
      SongUtils.getSongMetadataAsNumber(song, Song_MetadataTag.DURATION),
    ).toBe(120);
  });

  it("convertStringToSongMetadataValue should handle different types of values", () => {
    expect(SongUtils.convertStringToSongMetadataValue("42").value).toEqual({
      case: "intValue",
      value: new Int32Value({ value: 42 }),
    });
    expect(SongUtils.convertStringToSongMetadataValue("42.5").value).toEqual({
      case: "floatValue",
      value: new FloatValue({ value: 42.5 }),
    });
    expect(SongUtils.convertStringToSongMetadataValue("Test").value).toEqual({
      case: "stringValue",
      value: new StringValue({ value: "Test" }),
    });
  });

  it("convertSongMetadataValueToString should return correct string representation", () => {
    const stringValue = new Song_MetadataValue({
      value: { case: "stringValue", value: new StringValue({ value: "Test" }) },
    });
    expect(SongUtils.convertSongMetadataValueToString(stringValue)).toBe(
      "Test",
    );

    const dateValue = new Song_MetadataValue({
      value: {
        case: "timestamp",
        value: Timestamp.fromDate(new Date("2020-01-01")),
      },
    });
    expect(SongUtils.convertSongMetadataValueToString(dateValue)).toBe(
      "2020-01-01",
    );
  });

  it("convertAudioFormatToString should format audio format correctly", () => {
    const format = new AudioFormat({
      encoding: AudioFormat_Encoding.PCM,
      channels: 2,
      bits: 16,
      samplingRate: 44100,
    });
    expect(SongUtils.convertAudioFormatToString(format)).toBe(
      "PCM: 2ch 16bit 44100Hz",
    );
  });

  it("listAllSongMetadataTags should list all metadata tags except UNKNOWN", () => {
    const tags = SongUtils.listAllSongMetadataTags();
    expect(tags).toBeInstanceOf(Array);
    expect(tags).not.toContain(Song_MetadataTag.UNKNOWN);
    expect(tags).toContain(Song_MetadataTag.ALBUM_ARTIST);
  });
});
