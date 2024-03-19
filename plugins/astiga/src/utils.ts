import dayjs from "dayjs";
import { Song, SongMetadataTag, SongMetadataValue } from "./models/song";

export function convertSongMetadataValueToString(
  value?: SongMetadataValue,
): string {
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

export function getSongMetadataAsString(
  song: Song,
  tag: SongMetadataTag,
): string {
  const metadata = song.metadata[tag];
  return convertSongMetadataValueToString(metadata);
}

export function sleep(msec: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, msec));
}
