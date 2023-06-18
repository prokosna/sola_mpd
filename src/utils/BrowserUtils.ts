import { produce } from "immer";

import { MpdUtils } from "./MpdUtils";
import { SongUtils } from "./SongUtils";

import { BrowserFilter } from "@/models/browser";
import { FilterCondition, FilterConditionOperator } from "@/models/filter";
import { SongMetadataTag, SongMetadataValue } from "@/models/song";

export class BrowserUtils {
  static listBrowserFilterTags(): SongMetadataTag[] {
    return [
      SongMetadataTag.GENRE,
      SongMetadataTag.ARTIST,
      SongMetadataTag.ALBUM_ARTIST,
      SongMetadataTag.ALBUM,
      SongMetadataTag.COMPOSER,
      SongMetadataTag.LABEL,
      SongMetadataTag.DATE,
      SongMetadataTag.COMMENT,
    ];
  }

  static convertBrowserFiltersToConditions(
    browserFilter: BrowserFilter
  ): FilterCondition | undefined {
    if (browserFilter.selectedValues === undefined) {
      return;
    }
    if (browserFilter.selectedValues.length === 0) {
      return;
    }
    if (browserFilter.selectedValues.length === 1) {
      return FilterCondition.create({
        tag: browserFilter.tag,
        value: browserFilter.selectedValues[0],
        operator: FilterConditionOperator.EQUAL,
      });
    }
    const regValue = browserFilter.selectedValues
      .map((v) =>
        MpdUtils.escapeRegexString(
          SongUtils.convertSongMetadataValueToString(v)
        )
      )
      .join("|");
    return FilterCondition.create({
      tag: browserFilter.tag,
      value: SongMetadataValue.create({
        value: {
          $case: "stringValue",
          stringValue: regValue,
        },
      }),
      operator: FilterConditionOperator.REGEX,
    });
  }

  static normalizeBrowserFilters(
    browserFilters: BrowserFilter[]
  ): BrowserFilter[] {
    const newBrowserFilters = produce(browserFilters, (draft) => {
      draft.sort((a, b) => a.order - b.order);
      let order = 0;
      for (const filter of draft) {
        filter.order = order;
        order += 1;
        if (filter.selectedOrder == null) {
          filter.selectedOrder = -1;
        }
        if (filter.selectedValues.length === 0) {
          filter.selectedOrder = -1;
        } else if (filter.selectedValues.length > 0) {
          if (filter.selectedOrder <= 0) {
            // Add increased order number
            const nextOrderIndex =
              Math.max(0, ...draft.map((v) => v.selectedOrder)) + 1;
            filter.selectedOrder = nextOrderIndex;
          }
        }
      }

      const minOrderIndex = Math.min(
        ...draft.filter((v) => v.selectedOrder > 0).map((v) => v.selectedOrder)
      );
      for (const filter of draft.filter((v) => v.selectedOrder > 0)) {
        filter.selectedOrder -= minOrderIndex - 1;
      }
    });
    return newBrowserFilters;
  }
}
