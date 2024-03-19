import { StateCreator } from "zustand";

import { AllSlices } from "./AppStore";

import {
  ENDPOINT_APP_COMMON_SONG_TABLE_STATE,
  ENDPOINT_APP_LAYOUT_STATE,
} from "@/const";
import { LayoutState } from "@/models/layout";
import { CommonSongTableState } from "@/models/song_table";
import { ApiUtils } from "@/utils/ApiUtils";

export type LayoutSlice = {
  layoutState: LayoutState | undefined;
  commonSongTableState: CommonSongTableState | undefined;
  pullLayoutState: () => Promise<void>;
  pushLayoutState: (layoutState: LayoutState) => Promise<void>;
  updateLayoutState: (layoutState: LayoutState) => Promise<void>;
  pullCommonSongTableState: () => Promise<void>;
  updateCommonSongTableState: (
    commonSongTableState: CommonSongTableState,
  ) => Promise<void>;
};

export const createLayoutSlice: StateCreator<AllSlices, [], [], LayoutSlice> = (
  set,
  get,
) => ({
  layoutState: undefined,
  commonSongTableState: undefined,
  pullLayoutState: async () => {
    const state = await ApiUtils.get(ENDPOINT_APP_LAYOUT_STATE, LayoutState);
    set({
      layoutState: state,
    });
  },
  pushLayoutState: async (layoutState: LayoutState) => {
    if (get().layoutState === undefined) {
      await get().pullLayoutState();
    }
    await ApiUtils.post<LayoutState>(
      ENDPOINT_APP_LAYOUT_STATE,
      LayoutState,
      layoutState,
    );
  },
  updateLayoutState: async (layoutState: LayoutState) => {
    if (get().layoutState === undefined) {
      await get().pullLayoutState();
    }
    await ApiUtils.post<LayoutState>(
      ENDPOINT_APP_LAYOUT_STATE,
      LayoutState,
      layoutState,
    );
    set({
      layoutState,
    });
  },
  pullCommonSongTableState: async () => {
    const state = await ApiUtils.get(
      ENDPOINT_APP_COMMON_SONG_TABLE_STATE,
      CommonSongTableState,
    );
    set({
      commonSongTableState: state,
    });
  },
  updateCommonSongTableState: async (
    commonSongTableState: CommonSongTableState,
  ) => {
    if (get().commonSongTableState === undefined) {
      await get().pullCommonSongTableState();
    }
    await ApiUtils.post(
      ENDPOINT_APP_COMMON_SONG_TABLE_STATE,
      CommonSongTableState,
      commonSongTableState,
    );
    set({
      commonSongTableState,
    });
  },
});
