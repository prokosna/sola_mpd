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
 * Lists all metadata tags supported by the browser feature.
 *
 * @returns Array of supported metadata tags (e.g., ALBUM, ARTIST, GENRE)
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
 * Converts a BrowserFilter to a FilterCondition for MPD queries.
 *
 * For single value filters, creates an EQUAL condition.
 * For multiple values, creates a REGEX condition with values joined by '|'.
 *
 * @param browserFilter The browser filter to convert
 * @returns FilterCondition for the query, or undefined if no values are selected
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
 * Changes a browser filter's tag while preserving its order and selected values.
 *
 * @param currentFilters Current set of browser filters
 * @param target Filter to modify
 * @param next New tag to apply to the filter
 * @returns Updated array of browser filters
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
 * Removes a browser filter from the collection.
 * Updates the order and selected order of remaining filters.
 *
 * @param currentFilters Current set of browser filters
 * @param target Filter to remove
 * @returns Updated array of browser filters with the target removed
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
 * Updates the selected values of a browser filter.
 * Maintains proper ordering of filters based on selection state.
 *
 * @param currentFilters Current set of browser filters
 * @param target Filter to update
 * @param selectedValues New values to set for the filter
 * @returns Updated array of browser filters
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
 * Resets all browser filters to their initial state.
 * Clears all selected values while maintaining filter order.
 *
 * @param currentFilters Filters to reset
 * @returns Updated array of browser filters with all selections cleared
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
 * Fetches available values for each browser filter from MPD.
 *
 * For each filter, queries MPD for unique values of that tag,
 * taking into account the selections in other filters.
 *
 * @param mpdClient Client for MPD communication
 * @param profile Current MPD profile
 * @param browserFilters Current browser filters
 * @returns Map of tag to array of available values for that tag
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
