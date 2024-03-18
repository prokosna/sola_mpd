import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { SongUtils } from "@sola_mpd/domain/src/utils/SongUtils.js";
import { StringUtils } from "@sola_mpd/domain/src/utils/StringUtils.js";

function getSongRepresentation(
  song: Song,
  targetColumns: SongTableColumn[],
): string {
  let repr = "";
  for (const column of targetColumns) {
    const metadataValue = SongUtils.convertSongMetadataValueToString(
      song.metadata[column.tag],
    );
    repr += StringUtils.normalize(metadataValue) + " ";
  }
  return repr;
}

export function includesToken(
  song: Song,
  filterTokens: string[],
  targetColumns: SongTableColumn[],
): boolean {
  const songRepr = getSongRepresentation(song, targetColumns);
  return filterTokens.every((token) => songRepr.includes(token));
}

export function filterSongsByGlobalFilter(
  songs: Song[],
  filterTokens: string[],
  targetColumns: SongTableColumn[],
): Song[] {
  if (filterTokens.length === 0) {
    return songs;
  }
  return songs.filter((song) =>
    includesToken(song, filterTokens, targetColumns),
  );
}

export function filterStringsByGlobalFilter(
  strings: string[],
  shouldInclude: string[],
  filterTokens: string[],
): string[] {
  if (filterTokens.length === 0) {
    return strings;
  }
  return strings.filter((str) => {
    const strRepr = StringUtils.normalize(str);
    return (
      shouldInclude.includes(str) ||
      filterTokens.every((filterToken) => strRepr.includes(filterToken))
    );
  });
}
