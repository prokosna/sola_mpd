import { StringValue } from "@bufbuild/protobuf";
import {
  FilterCondition,
  FilterCondition_Operator,
} from "@sola_mpd/domain/src/models/filter_pb.js";
import { RecentlyAddedFilter } from "@sola_mpd/domain/src/models/recently_added_pb.js";
import {
  Song,
  Song_MetadataTag,
  Song_MetadataValue,
} from "@sola_mpd/domain/src/models/song_pb.js";
import { escapeRegexString } from "@sola_mpd/domain/src/utils/mpdUtils.js";
import {
  convertSongMetadataValueToString,
  getSongMetadataAsNumber,
  getSongMetadataAsString,
} from "@sola_mpd/domain/src/utils/songUtils.js";

/**
 * Get supported metadata tags.
 *
 * @returns Supported tags
 */
export function listRecentlyAddedSongMetadataTags(): Song_MetadataTag[] {
  return [
    Song_MetadataTag.ALBUM,
    Song_MetadataTag.ALBUM_ARTIST,
    Song_MetadataTag.ARTIST,
    Song_MetadataTag.COMPOSER,
  ];
}

/**
 * Convert filter to condition.
 *
 * @param filter Target filter
 * @param selectedValuesMap Values map
 * @returns Filter condition
 */
export function convertRecentlyAddedFilterToCondition(
  filter: RecentlyAddedFilter,
  selectedValuesMap: Map<Song_MetadataTag, Song_MetadataValue[]>,
): FilterCondition | undefined {
  const selectedValues = selectedValuesMap.get(filter.tag);
  if (selectedValues === undefined) {
    return undefined;
  }

  if (selectedValues.length === 0) {
    return undefined;
  }
  if (selectedValues.length === 1) {
    return new FilterCondition({
      tag: filter.tag,
      value: selectedValues[0],
      operator: FilterCondition_Operator.EQUAL,
    });
  }

  const regexValue = selectedValues
    .map((value) => escapeRegexString(convertSongMetadataValueToString(value)))
    .join("|");
  return new FilterCondition({
    tag: filter.tag,
    value: new Song_MetadataValue({
      value: {
        case: "stringValue",
        value: new StringValue({ value: regexValue }),
      },
    }),
    operator: FilterCondition_Operator.REGEX,
  });
}

/**
 * Change filter tag.
 *
 * @param currentFilters Current filters
 * @param target Target filter
 * @param next Next tag
 * @returns Updated filters
 */
export function changeRecentlyAddedFilterToTheOtherTag(
  currentFilters: RecentlyAddedFilter[],
  target: RecentlyAddedFilter,
  next: Song_MetadataTag,
): RecentlyAddedFilter[] {
  const index = currentFilters.findIndex((filter) => filter.tag === target.tag);
  if (index < 0) {
    throw new Error(
      `The filter doesn't exist: ${Song_MetadataTag[target.tag]}`,
    );
  }
  const newFilters = [...currentFilters];
  newFilters[index].tag = next;
  return newFilters;
}

/**
 * Add next filter.
 *
 * @param currentFilters Current filters
 * @param target Target filter
 * @param next Next tag
 * @returns Updated filters
 */
export function addRecentlyAddedFilterNext(
  currentFilters: RecentlyAddedFilter[],
  target: RecentlyAddedFilter,
  next: Song_MetadataTag,
): RecentlyAddedFilter[] {
  const index = currentFilters.findIndex((filter) => filter.tag === target.tag);
  if (index < 0) {
    throw new Error(
      `The filter doesn't exist: ${Song_MetadataTag[target.tag]}`,
    );
  }
  const newFilters = [...currentFilters];
  newFilters.splice(
    index + 1,
    0,
    new RecentlyAddedFilter({
      tag: next,
    }),
  );
  return newFilters;
}

/**
 * Remove filter.
 *
 * @param currentFilters Current filters
 * @param target Target filter
 * @returns Updated filters
 */
export function removeRecentlyAddedFilter(
  currentFilters: RecentlyAddedFilter[],
  target: RecentlyAddedFilter,
): RecentlyAddedFilter[] {
  const index = currentFilters.findIndex((filter) => filter.tag === target.tag);
  if (index < 0) {
    throw new Error(
      `The filter doesn't exist: ${Song_MetadataTag[target.tag]}`,
    );
  }
  const newFilters = [...currentFilters];
  newFilters.splice(index, 1);
  return newFilters;
}

/**
 * Extract filter values.
 *
 * @param all_songs All songs
 * @returns Values map
 */
export function extractRecentlyAddedFilterValues(
  all_songs: Song[],
): Map<Song_MetadataTag, string[]> {
  const all_tags = listRecentlyAddedSongMetadataTags();
  const valueTimestampMap = new Map<Song_MetadataTag, Map<string, number>>();
  for (const song of all_songs) {
    const timestamp = getSongMetadataAsNumber(
      song,
      Song_MetadataTag.UPDATED_AT,
    );
    if (timestamp === undefined) {
      continue;
    }
    for (const tag of all_tags) {
      const value = getSongMetadataAsString(song, tag);
      if (value === undefined) {
        continue;
      }
      const existing = valueTimestampMap.get(tag);
      if (existing === undefined) {
        valueTimestampMap.set(tag, new Map([[value, timestamp]]));
        continue;
      }
      const existingTimestamp = existing.get(value);
      if (existingTimestamp === undefined || existingTimestamp < timestamp) {
        existing.set(value, timestamp);
      }
    }
  }

  const filterValuesMap = new Map<Song_MetadataTag, string[]>();
  for (const [tag, values] of valueTimestampMap.entries()) {
    const valuesArray = Array.from(values.keys()).sort(
      (a, b) => values.get(b)! - values.get(a)!,
    );
    filterValuesMap.set(tag, valuesArray);
  }

  return filterValuesMap;
}
