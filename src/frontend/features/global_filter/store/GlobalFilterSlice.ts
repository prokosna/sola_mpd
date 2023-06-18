import { StateCreator } from "zustand";

import { AllSlices } from "../../global/store/AppStore";

export type GlobalFilterSlice = {
  globalFilterTokens: string[];
  updateGlobalFilterText: (filterText: string) => Promise<void>;
};

export const createGlobalFilterSlice: StateCreator<
  AllSlices,
  [],
  [],
  GlobalFilterSlice
> = (set) => ({
  globalFilterTokens: [],
  updateGlobalFilterText: async (filterText: string) => {
    const chunks = filterText.split(" ");
    const tokens = chunks
      .map((v) => v.trim())
      .filter((v) => v !== "")
      .map((v) => v.toLowerCase());

    set({
      globalFilterTokens: tokens,
    });
  },
});
