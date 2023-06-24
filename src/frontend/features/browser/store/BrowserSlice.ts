import { StateCreator } from "zustand";

import { AllSlices } from "../../global/store/AppStore";

import { ENDPOINT_APP_BROWSER_STATE } from "@/const";
import { BrowserFilter, BrowserState } from "@/models/browser";
import { FilterCondition } from "@/models/filter";
import { MpdRequest } from "@/models/mpd/mpd_command";
import { MpdProfile } from "@/models/mpd/mpd_profile";
import { Song, SongMetadataTag } from "@/models/song";
import { ApiUtils } from "@/utils/ApiUtils";
import { BrowserUtils } from "@/utils/BrowserUtils";
import { MpdUtils } from "@/utils/MpdUtils";

export type BrowserSlice = {
  browserSongs: Song[];
  browserFilters: BrowserFilter[] | undefined;
  browserFilterValuesList: Map<SongMetadataTag, string[]>;
  pullBrowserSongs: (
    profile: MpdProfile,
    browserFilters: BrowserFilter[]
  ) => Promise<void>;
  pullBrowserFilters: () => Promise<void>;
  updateBrowserFilters: (browserFilters: BrowserFilter[]) => Promise<void>;
  pullBrowserFilterValuesList: (
    profile: MpdProfile,
    browserFilters: BrowserFilter[]
  ) => Promise<void>;
};

export const createBrowserSlice: StateCreator<
  AllSlices,
  [],
  [],
  BrowserSlice
> = (set, get) => ({
  browserSongs: [],
  browserFilters: undefined,
  browserFilterValuesList: new Map(),
  pullBrowserSongs: async (
    profile: MpdProfile,
    browserFilters: BrowserFilter[]
  ) => {
    get().setIsSongTableLoading(true);

    const conditions = browserFilters
      .filter((v) => v.selectedValues !== undefined)
      .map((v) => BrowserUtils.convertBrowserFiltersToConditions(v))
      .filter((v) => v !== undefined) as FilterCondition[];
    if (conditions.length === 0) {
      set({
        browserSongs: [],
      });
      return;
    }

    const req = MpdRequest.create({
      profile,
      command: { $case: "search", search: { conditions } },
    });
    const res = await MpdUtils.command(req);
    if (res.command?.$case !== "search") {
      throw Error(`Invalid MPD response ${res}`);
    }
    const songs = res.command.search.songs;

    set({
      browserSongs: songs,
    });
  },
  pullBrowserFilters: async () => {
    const state = await ApiUtils.get<BrowserState>(
      ENDPOINT_APP_BROWSER_STATE,
      BrowserState
    );

    set({
      browserFilters: state.filters,
    });
  },
  updateBrowserFilters: async (filters: BrowserFilter[]) => {
    if (get().browserFilters === undefined) {
      await get().pullBrowserFilters();
    }

    await ApiUtils.post<BrowserState>(
      ENDPOINT_APP_BROWSER_STATE,
      BrowserState,
      BrowserState.create({ filters })
    );

    set({
      browserFilters: filters,
    });
  },
  pullBrowserFilterValuesList: async (
    profile: MpdProfile,
    browserFilters: BrowserFilter[]
  ) => {
    const selectedFiltersSorted = Array.from(
      browserFilters.filter(
        (v) => v.selectedValues !== undefined && v.selectedValues.length !== 0
      )
    ).sort((a, b) => a.selectedOrder - b.selectedOrder);

    const filterValuesSet: [SongMetadataTag, string[]][] = await Promise.all(
      browserFilters.map(async (filter) => {
        const conditions: FilterCondition[] = [];
        if (filter.selectedOrder !== 1) {
          for (const selectedFilter of selectedFiltersSorted) {
            if (selectedFilter === filter) {
              break;
            }
            const condition =
              BrowserUtils.convertBrowserFiltersToConditions(selectedFilter);
            if (condition !== undefined) {
              conditions.push(condition);
            }
          }
        }
        const req = MpdRequest.create({
          profile,
          command: { $case: "list", list: { tag: filter.tag, conditions } },
        });
        const res = await MpdUtils.command(req);
        if (res.command?.$case !== "list") {
          throw Error(`Invalid MPD response ${res}`);
        }
        const values = res.command.list.values;
        return [filter.tag, values];
      })
    );

    set({
      browserFilterValuesList: new Map(filterValuesSet),
    });
  },
});
