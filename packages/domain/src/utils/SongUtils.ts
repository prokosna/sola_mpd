import {
  FloatValue,
  Int32Value,
  StringValue,
  Timestamp,
} from "@bufbuild/protobuf";
import dayjs from "dayjs";

import {
  AudioFormat,
  AudioFormat_Encoding,
  Song,
  Song_MetadataTag,
  Song_MetadataValue,
} from "../models/song_pb.js";

export class SongUtils {
  static getSongMetadataAsString(song: Song, tag: Song_MetadataTag): string {
    const metadata = song.metadata[tag];
    return this.convertSongMetadataValueToString(metadata);
  }

  static getSongMetadataAsNumber(
    song: Song,
    tag: Song_MetadataTag,
  ): number | undefined {
    const value = song.metadata[tag];
    switch (value.value.case) {
      case "floatValue":
        return value.value.value.value;
      case "stringValue":
        return Number(value.value.value.value);
      case "intValue":
        return value.value.value.value;
      case "timestamp":
        return value.value.value.toDate().getTime();
      case "format":
        return value.value.value.samplingRate;
    }
    return undefined;
  }

  static convertStringToSongMetadataValue(value: string): Song_MetadataValue {
    if (value === "") {
      return new Song_MetadataValue({
        value: {
          case: "stringValue",
          value: new StringValue({ value: "" }),
        },
      });
    }

    // Date
    const tryDate = dayjs(value);
    if (tryDate.isValid() && value.includes("-")) {
      return new Song_MetadataValue({
        value: {
          case: "timestamp",
          value: Timestamp.fromDate(tryDate.toDate()),
        },
      });
    }

    // number
    const tryNumber = Number(value);
    if (!isNaN(tryNumber)) {
      if (tryNumber % 1 === 0) {
        return new Song_MetadataValue({
          value: {
            case: "intValue",
            value: new Int32Value({ value: tryNumber }),
          },
        });
      } else {
        return new Song_MetadataValue({
          value: {
            case: "floatValue",
            value: new FloatValue({ value: tryNumber }),
          },
        });
      }
    }

    // string
    return new Song_MetadataValue({
      value: {
        case: "stringValue",
        value: new StringValue({ value }),
      },
    });
  }

  static convertSongMetadataValueToString(value: Song_MetadataValue): string {
    switch (value.value.case) {
      case "floatValue":
        return String(value.value.value.value);
      case "intValue":
        return String(value.value.value.value);
      case "timestamp":
        return dayjs(value.value.value.toDate()).format("YYYY-MM-DD");
      case "stringValue":
        return value.value.value.value || "";
      case "format":
        return this.convertAudioFormatToString(value.value.value);
      default:
        return "";
    }
  }

  static convertAudioFormatToString(format: AudioFormat): string {
    return `${AudioFormat_Encoding[format.encoding]}: ${format.channels}ch ${
      format.bits
    }bit ${format.samplingRate}Hz`;
  }

  static listAllSongMetadataTags(): Song_MetadataTag[] {
    return Object.keys(Song_MetadataTag)
      .filter((v) => isNaN(Number(v)))
      .map((v) => Song_MetadataTag[v as keyof typeof Song_MetadataTag])
      .filter((v) => v !== Song_MetadataTag.UNKNOWN);
  }
}
