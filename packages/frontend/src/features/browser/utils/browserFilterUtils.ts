import { StringValue } from "@bufbuild/protobuf";
import { BrowserFilter } from "@sola_mpd/domain/src/models/browser_pb.js";
import {
  FilterCondition,
  FilterCondition_Operator,
} from "@sola_mpd/domain/src/models/filter_pb.js";
import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import {
  Song_MetadataTag,
  Song_MetadataValue,
} from "@sola_mpd/domain/src/models/song_pb.js";
import { escapeRegexString } from "@sola_mpd/domain/src/utils/mpdUtils.js";
import { convertSongMetadataValueToString } from "@sola_mpd/domain/src/utils/songUtils.js";

import { MpdClient } from "../../mpd";

/**
 * List up song metadata tags that are supported by browser.
 */
export function listBrowserSongMetadataTags(): Song_MetadataTag[] {
  return [
    Song_MetadataTag.ALBUM,
    Song_MetadataTag.ALBUM_ARTIST,
    Song_MetadataTag.ARTIST,
    Song_MetadataTag.COMPOSER,
    Song_MetadataTag.GENRE,
  ];
}

/**
 * Convert BrowserFilter to FilterCondition.
 * @param browserFilter browser filter
 * @returns the converted filter condition. If the browser filter has no selected values, return undefined.
 */
export function convertBrowserFilterToCondition(
  browserFilter: BrowserFilter,
): FilterCondition | undefined {
  if (browserFilter.selectedValues.length === 0) {
    return undefined;
  }

  if (browserFilter.selectedValues.length === 1) {
    return new FilterCondition({
      tag: browserFilter.tag,
      value: browserFilter.selectedValues[0],
      operator: FilterCondition_Operator.EQUAL,
    });
  }

  const regexValue = browserFilter.selectedValues
    .map((value) => escapeRegexString(convertSongMetadataValueToString(value)))
    .join("|");
  return new FilterCondition({
    tag: browserFilter.tag,
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
 * Normalize browser filters.
 * The filters are sorted by "order" and each "order" is set to the smallest available value.
 * If a filter has no selected values, "selectedOrder" is set to -1.
 * @param filters browser filters to normalize
 * @returns the normalized browser filters
 */
function normalizeBrowserFilters(filters: BrowserFilter[]): BrowserFilter[] {
  const newFilters = [...filters];
  newFilters.sort((a, b) => a.order - b.order);
  let order = 0;
  for (const newFilter of newFilters) {
    // order
    newFilter.order = order;
    order += 1;

    // selected order
    if (newFilter.selectedValues.length > 0) {
      if (newFilter.selectedOrder < 0) {
        const nextOrderIndex =
          Math.max(0, ...newFilters.map((filter) => filter.selectedOrder)) + 1;
        newFilter.selectedOrder = nextOrderIndex;
      }
    } else {
      newFilter.selectedOrder = -1;
    }
  }

  // Normalize selectedOrder
  const minOrderIndex = Math.min(
    ...newFilters
      .filter((filter) => filter.selectedOrder > 0)
      .map((filter) => filter.selectedOrder),
  );
  for (const newFilter of newFilters) {
    if (newFilter.selectedOrder > 0) {
      newFilter.selectedOrder -= minOrderIndex - 1;
    }
  }
  return newFilters;
}

/**
 * Change a browser filter to the other tag.
 * @param currentFilters browser filters
 * @param target the filter to change
 * @param next the next tag
 * @returns the new browser filters
 */
export function changeBrowserFilterToTheOtherTag(
  currentFilters: BrowserFilter[],
  target: BrowserFilter,
  next: Song_MetadataTag,
): BrowserFilter[] {
  const index = currentFilters.findIndex((filter) => filter.tag === target.tag);
  if (index < 0) {
    throw new Error(
      `The filter doesn't exist: ${Song_MetadataTag[target.tag]}`,
    );
  }
  const newFilters = [...currentFilters];
  newFilters[index].selectedValues = [];
  newFilters[index].selectedOrder = -1;
  newFilters[index].tag = next;
  return normalizeBrowserFilters(newFilters);
}

export function addBrowserFilterNext(
  currentFilters: BrowserFilter[],
  target: BrowserFilter,
  next: Song_MetadataTag,
): BrowserFilter[] {
  const index = currentFilters.findIndex((filter) => filter.tag === target.tag);
  if (index < 0) {
    throw new Error(
      `The filter doesn't exist: ${Song_MetadataTag[target.tag]}`,
    );
  }
  const targetOrder = currentFilters[index].order;
  const newFilters = [...currentFilters];
  for (const newFilter of newFilters) {
    if (newFilter.order > targetOrder) {
      newFilter.order += 1;
    }
  }
  newFilters.push(
    new BrowserFilter({
      tag: next,
      selectedOrder: -1,
      selectedValues: [],
      order: targetOrder + 1,
    }),
  );
  return normalizeBrowserFilters(newFilters);
}

/**
 * Remove a browser filter.
 * @param currentFilters browser filters
 * @param target the filter to remove
 * @returns the new browser filters
 */
export function removeBrowserFilter(
  currentFilters: BrowserFilter[],
  target: BrowserFilter,
): BrowserFilter[] {
  const index = currentFilters.findIndex((filter) => filter.tag === target.tag);
  if (index < 0) {
    throw new Error(
      `The filter doesn't exist: ${Song_MetadataTag[target.tag]}`,
    );
  }
  const newFilters = [...currentFilters];
  newFilters.splice(index, 1);
  return normalizeBrowserFilters(newFilters);
}

/**
 * Select values for a browser filter.
 * @param currentFilters browser filters
 * @param target the filter to select values for
 * @param selectedValues the selected values
 * @returns the new browser filters
 */
export function selectBrowserFilterValues(
  currentFilters: BrowserFilter[],
  target: BrowserFilter,
  selectedValues: string[],
): BrowserFilter[] {
  const index = currentFilters.findIndex((filter) => filter.tag === target.tag);
  if (index < 0) {
    throw new Error(
      `The filter doesn't exist: ${Song_MetadataTag[target.tag]}`,
    );
  }
  const newFilters = [...currentFilters];
  newFilters[index].selectedValues = selectedValues.map(
    (value) =>
      new Song_MetadataValue({
        value: {
          case: "stringValue",
          value: {
            value,
          },
        },
      }),
  );
  return normalizeBrowserFilters(newFilters);
}

/**
 * Reset all browser filters.
 * Each filter's selected values are cleared.
 * @param currentFilters browser filters to reset
 * @returns the new browser filters
 */
export function resetAllBrowserFilters(
  currentFilters: BrowserFilter[],
): BrowserFilter[] {
  const newFilters = [...currentFilters];
  for (const newFilter of newFilters) {
    newFilter.selectedValues = [];
  }
  return normalizeBrowserFilters(newFilters);
}

/**
 * Fetch browser filter values.
 * @param mpdClient MPD client
 * @param profile profile
 * @param browserFilters browser filters
 * @returns the map of filter values. The key is a filter tag and the value is an array of strings.
 * For example, if the filter tag is "artist", the value is an array of artists.
 */
export async function fetchBrowserFilterValues(
  mpdClient: MpdClient,
  profile: MpdProfile,
  browserFilters: BrowserFilter[],
): Promise<Map<Song_MetadataTag, string[]>> {
  const selectedSortedFilters = Array.from(
    browserFilters.filter(
      (browserFilter) => browserFilter.selectedValues.length !== 0,
    ),
  ).sort((a, b) => a.selectedOrder - b.selectedOrder);

  // Fetch values for each filter in parallel.
  const browserFilterValuesPairs: [Song_MetadataTag, string[]][] =
    await Promise.all(
      browserFilters.map(async (browserFilter) => {
        // The conditions for each filter are not independent.
        // The conditions depend on the order in which the values of the filter were selected,
        // and match the conditions of all filters selected prior to this one.
        const conditions: FilterCondition[] = [];
        if (browserFilter.selectedOrder !== 1) {
          for (const selectedFilter of selectedSortedFilters) {
            if (browserFilter === selectedFilter) {
              break;
            }
            const condition = convertBrowserFilterToCondition(selectedFilter);
            if (condition === undefined) {
              continue;
            }
            conditions.push(condition);
          }
        }

        const req = new MpdRequest({
          profile,
          command: {
            case: "list",
            value: {
              tag: browserFilter.tag,
              conditions,
            },
          },
        });
        const res = await mpdClient.command(req);
        if (res.command.case !== "list") {
          throw Error(`Invalid MPD response: ${res.toJsonString()}`);
        }
        return [browserFilter.tag, res.command.value.values];
      }),
    );

  return new Map(browserFilterValuesPairs);
}
