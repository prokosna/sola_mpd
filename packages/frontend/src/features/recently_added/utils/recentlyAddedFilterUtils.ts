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
 * List up song metadata tags that are supported by recently added view.
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
 * Convert RecentlyAddedFilter to FilterCondition.
 * @param filter recently added filter
 * @returns the converted filter condition. If the recently added filter has no selected values, return undefined.
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
 * Change a recently added filter to the other tag.
 * @param currentFilters recently added filters
 * @param target the filter to change
 * @param next the next tag
 * @returns the new recently added filters
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
 * Remove a recently added filter.
 * @param currentFilters recently added filters
 * @param target the filter to remove
 * @returns the new recently added filters
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
 * Fetch recently added filter values.
 * @param mpdClient MPD client
 * @param profile profile
 * @param recentlyAddedFilters recently added filters
 * @returns the map of filter values. The key is a filter tag and the value is an array of strings.
 * For example, if the filter tag is "artist", the value is an array of artists.
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
