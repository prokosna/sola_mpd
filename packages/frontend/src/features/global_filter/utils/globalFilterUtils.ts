import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { convertSongMetadataValueToString } from "@sola_mpd/domain/src/utils/songUtils.js";
import { normalize } from "@sola_mpd/domain/src/utils/stringUtils.js";

/**
 * Creates a normalized string representation of a song's metadata.
 *
 * Features:
 * - Selective metadata inclusion
 * - Normalized string output
 * - Space-separated format
 * - Accent-insensitive text
 *
 * Processing:
 * 1. Extracts metadata values
 * 2. Converts to string format
 * 3. Normalizes each value
 * 4. Joins with spaces
 *
 * @param song Song to process
 * @param targetColumns Metadata fields to include
 * @returns Normalized metadata string
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
 * Tests if a song matches all filter tokens.
 *
 * Features:
 * - Case-insensitive matching
 * - Accent-insensitive comparison
 * - Metadata field selection
 * - AND-based token matching
 *
 * Algorithm:
 * 1. Generate song representation
 * 2. Test each token presence
 * 3. Require all tokens to match
 *
 * Performance:
 * - Early exit on first non-match
 * - Single representation generation
 * - Optimized string operations
 *
 * @param song Target song
 * @param filterTokens Search terms
 * @param targetColumns Fields to search
 * @returns true if all tokens match
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
 * Filters songs based on global search criteria.
 *
 * Features:
 * - Multi-token filtering
 * - Metadata field selection
 * - Case-insensitive search
 * - Accent-insensitive search
 *
 * Performance:
 * - Optimized for large song lists
 * - Early filtering
 * - Minimal memory allocation
 *
 * @param songs Songs to filter
 * @param filterTokens Search terms
 * @param targetColumns Fields to search
 * @returns Filtered song array
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
 * Filters strings with priority inclusion.
 *
 * Features:
 * - Priority string inclusion
 * - Case-insensitive filtering
 * - Accent-insensitive matching
 * - Multi-token support
 *
 * Algorithm:
 * 1. Include priority strings
 * 2. Filter remaining strings
 * 3. Combine results
 * 4. Remove duplicates
 *
 * @param strings Strings to filter
 * @param shouldInclude Priority strings
 * @param filterTokens Search terms
 * @returns Filtered string array
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
