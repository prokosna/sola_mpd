import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { convertSongMetadataValueToString } from "@sola_mpd/domain/src/utils/songUtils.js";
import { normalize } from "@sola_mpd/domain/src/utils/stringUtils.js";

/**
 * Generates a string representation of a song based on specified columns.
 *
 * @param song - The Song object to generate representation for.
 * @param targetColumns - An array of SongTableColumn objects specifying which metadata to include.
 * @returns A normalized string representation of the song's metadata.
 */
function getSongRepresentation(
  song: Song,
  targetColumns: SongTableColumn[],
): string {
  let representation = "";
  for (const column of targetColumns) {
    const metadataValue = convertSongMetadataValueToString(
      song.metadata[column.tag],
    );
    representation += normalize(metadataValue) + " ";
  }
  return representation;
}

/**
 * Checks if a song's metadata includes all specified filter tokens.
 *
 * @param song - The Song object to check.
 * @param filterTokens - An array of lowercase strings to search for in the song's metadata.
 * @param targetColumns - An array of SongTableColumn objects specifying which metadata to include in the search.
 * @returns A boolean indicating whether all filter tokens are found in the song's metadata.
 */
export function includesToken(
  song: Song,
  filterTokens: string[],
  targetColumns: SongTableColumn[],
): boolean {
  const representation = getSongRepresentation(song, targetColumns);
  return filterTokens.every((token) => representation.includes(token));
}

/**
 * Filters an array of songs based on global filter tokens and target columns.
 *
 * @param songs - An array of Song objects to be filtered.
 * @param filterTokens - An array of lowercase strings representing the global filter tokens.
 * @param targetColumns - An array of SongTableColumn objects specifying which metadata to include in the filtering process.
 * @returns An array of Song objects that match the filter criteria.
 */
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

/**
 * Filters an array of strings based on global filter tokens and a list of strings to always include.
 *
 * @param strings - An array of strings to be filtered.
 * @param shouldInclude - An array of strings that should always be included in the result.
 * @param filterTokens - An array of lowercase strings representing the global filter tokens.
 * @returns An array of strings that match the filter criteria or are in the shouldInclude list.
 */
export function filterStringsByGlobalFilter(
  strings: string[],
  shouldInclude: string[],
  filterTokens: string[],
): string[] {
  if (filterTokens.length === 0) {
    return strings;
  }
  return strings.filter((str) => {
    const representation = normalize(str);
    return (
      shouldInclude.includes(str) ||
      filterTokens.every((filterToken) => representation.includes(filterToken))
    );
  });
}
