import dayjs from "dayjs";

import {
  AudioFormat,
  Song,
  SongMetadataTag,
  SongMetadataValue,
} from "@/models/song";

export class SongUtils {
  static getSongMetadataAsString(song: Song, tag: SongMetadataTag): string {
    const metadata = song.metadata[tag];
    return this.convertSongMetadataValueToString(metadata);
  }

  static getSongMetadataAsNumber(
    song: Song,
    tag: SongMetadataTag
  ): number | undefined {
    const value = song.metadata[tag];
    switch (value?.value?.$case) {
      case "floatValue":
        return value.value.floatValue;
      case "stringValue":
        return Number(value.value.stringValue);
      case "intValue":
        return value.value.intValue;
      case "timestamp":
        return value.value.timestamp.getTime();
      case "format":
        return value.value.format.samplingRate;
    }
    return undefined;
  }

  static convertStringToSongMetadataValue(value: string): SongMetadataValue {
    if (value === "") {
      return SongMetadataValue.create({
        value: {
          $case: "stringValue",
          stringValue: "",
        },
      });
    }

    // Date
    const tryDate = dayjs(value);
    if (tryDate.isValid() && value.includes("-")) {
      return SongMetadataValue.create({
        value: {
          $case: "timestamp",
          timestamp: tryDate.toDate(),
        },
      });
    }

    // number
    const tryNumber = Number(value);
    if (!isNaN(tryNumber)) {
      if (tryNumber % 1 === 0) {
        return SongMetadataValue.create({
          value: {
            $case: "intValue",
            intValue: tryNumber,
          },
        });
      } else {
        return SongMetadataValue.create({
          value: {
            $case: "floatValue",
            floatValue: tryNumber,
          },
        });
      }
    }

    // string
    return SongMetadataValue.create({
      value: {
        $case: "stringValue",
        stringValue: value,
      },
    });
  }

  static convertSongMetadataValueToString(value?: SongMetadataValue): string {
    switch (value?.value?.$case) {
      case "floatValue":
        return String(value.value.floatValue);
      case "intValue":
        return String(value.value.intValue);
      case "timestamp":
        return dayjs(value.value.timestamp).format("YYYY-MM-DD");
      case "stringValue":
        return value.value.stringValue || "";
      case "format":
        return this.convertAudioFormatToString(value.value.format);
      default:
        return "";
    }
  }

  static convertAudioFormatToString(format: AudioFormat): string {
    return `${format.encoding}:${format.channels}ch/${format.bits}bit/${format.samplingRate}Hz`;
  }

  static listAllSongMetadataTags(): SongMetadataTag[] {
    return Object.keys(SongMetadataTag)
      .filter((v) => isNaN(Number(v)))
      .map((v) => SongMetadataTag[v as keyof typeof SongMetadataTag])
      .filter((v) => v !== SongMetadataTag.UNKNOWN);
  }
}
