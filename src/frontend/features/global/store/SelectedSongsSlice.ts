import { StateCreator } from "zustand";

import { AllSlices } from "./AppStore";

import { Song } from "@/models/song";

export type SelectedSongsSlice = {
  selectedSongs: Song[];
  updateSelectedSongs: (songs: Song[]) => Promise<void>;
};

export const createSelectedSongsSlice: StateCreator<
  AllSlices,
  [],
  [],
  SelectedSongsSlice
> = (set, get) => ({
  selectedSongs: [],
  updateSelectedSongs: async (songs: Song[]) => {
    set({ selectedSongs: songs });
  },
});
