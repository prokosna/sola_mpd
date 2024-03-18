import { StringValue } from "@bufbuild/protobuf";
import { BrowserFilter } from "@sola_mpd/domain/src/models/browser_pb.js";
import {
  FilterCondition,
  FilterCondition_Operator,
} from "@sola_mpd/domain/src/models/filter_pb.js";
import {
  Song_MetadataTag,
  Song_MetadataValue,
} from "@sola_mpd/domain/src/models/song_pb.js";
import { MpdUtils } from "@sola_mpd/domain/src/utils/MpdUtils.js";
import { SongUtils } from "@sola_mpd/domain/src/utils/SongUtils.js";

export function listBrowserSongMetadataTags(): Song_MetadataTag[] {
  return [
    Song_MetadataTag.ALBUM,
    Song_MetadataTag.ALBUM_ARTIST,
    Song_MetadataTag.ARTIST,
    Song_MetadataTag.COMPOSER,
    Song_MetadataTag.FORMAT,
    Song_MetadataTag.GENRE,
    Song_MetadataTag.LABEL,
  ];
}

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
    .map((value) =>
      MpdUtils.escapeRegexString(
        SongUtils.convertSongMetadataValueToString(value),
      ),
    )
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

export function changeFilterToOtherTag(
  filters: BrowserFilter[],
  target: BrowserFilter,
  next: Song_MetadataTag,
): BrowserFilter[] {
  const index = filters.findIndex((filter) => filter.tag === target.tag);
  if (index < 0) {
    throw new Error(
      `The filter doesn't exist: ${Song_MetadataTag[target.tag]}`,
    );
  }
  const newFilters = [...filters];
  newFilters[index].selectedValues = [];
  newFilters[index].selectedOrder = -1;
  newFilters[index].tag = next;
  return normalizeBrowserFilters(newFilters);
}

export function addFilterNext(
  filters: BrowserFilter[],
  target: BrowserFilter,
  next: Song_MetadataTag,
): BrowserFilter[] {
  const index = filters.findIndex((filter) => filter.tag === target.tag);
  if (index < 0) {
    throw new Error(
      `The filter doesn't exist: ${Song_MetadataTag[target.tag]}`,
    );
  }
  const targetOrder = filters[index].order;
  const newFilters = [...filters];
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

export function removeFilter(
  filters: BrowserFilter[],
  target: BrowserFilter,
): BrowserFilter[] {
  const index = filters.findIndex((filter) => filter.tag === target.tag);
  if (index < 0) {
    throw new Error(
      `The filter doesn't exist: ${Song_MetadataTag[target.tag]}`,
    );
  }
  const newFilters = [...filters];
  newFilters.splice(index, 1);
  return normalizeBrowserFilters(newFilters);
}

export function selectFilterValues(
  filters: BrowserFilter[],
  target: BrowserFilter,
  selectedValues: string[],
): BrowserFilter[] {
  const index = filters.findIndex((filter) => filter.tag === target.tag);
  if (index < 0) {
    throw new Error(
      `The filter doesn't exist: ${Song_MetadataTag[target.tag]}`,
    );
  }
  const newFilters = [...filters];
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

export function resetAllFilters(filters: BrowserFilter[]): BrowserFilter[] {
  const newFilters = [...filters];
  for (const newFilter of newFilters) {
    newFilter.selectedValues = [];
  }
  return normalizeBrowserFilters(newFilters);
}
