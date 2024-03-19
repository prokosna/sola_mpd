import { v4 as uuidv4 } from "uuid";
import { StateCreator } from "zustand";

import { AllSlices } from "../../global/store/AppStore";

import { ENDPOINT_APP_SAVED_SEARCHES } from "@/const";
import { FilterCondition, FilterConditionOperator } from "@/models/filter";
import { MpdRequest } from "@/models/mpd/mpd_command";
import { MpdProfile } from "@/models/mpd/mpd_profile";
import { Query, SavedSearches, Search } from "@/models/search";
import { Song, SongMetadataTag, SongMetadataValue } from "@/models/song";
import { SongTableColumn } from "@/models/song_table";
import { ApiUtils } from "@/utils/ApiUtils";
import { FilterUtils } from "@/utils/FilterUtils";
import { MpdUtils } from "@/utils/MpdUtils";
import { SearchUtils } from "@/utils/SearchUtils";

function getDefaultSearch(): Search {
  return Search.create({
    name: "New Search",
    queries: [
      Query.create({
        conditions: [
          FilterCondition.create({
            uuid: uuidv4(),
            tag: SongMetadataTag.TITLE,
            operator: FilterConditionOperator.EQUAL,
            value: SongMetadataValue.create({
              value: {
                $case: "stringValue",
                stringValue: "",
              },
            }),
          }),
        ],
      }),
    ],
    columns: undefined,
  });
}

export type SearchSlice = {
  searchSongs: Song[];
  editingSearch: Search;
  isEditingSearchSaved: boolean;
  savedSearches: Search[] | undefined;
  searchSongTableColumns: SongTableColumn[] | undefined;
  getDefaultSearch: () => Search;
  pullSearchSongs: (profile: MpdProfile, search: Search) => Promise<void>;
  updateEditingSearch: (
    search: Search,
    isRestoredFromSavedSearch?: boolean,
  ) => Promise<void>;
  pullSavedSearches: () => Promise<void>;
  updateSavedSearches: (searches: Search[]) => Promise<void>;
  updateIsEditingSearchSaved: (isEditing: boolean) => Promise<void>;
  updateSearchSongTableColumns: (
    columns: SongTableColumn[] | undefined,
  ) => Promise<void>;
  updateSearchSongs: (songs: Song[]) => void;
};

export const createSearchSlice: StateCreator<AllSlices, [], [], SearchSlice> = (
  set,
  get,
) => ({
  searchSongs: [],
  editingSearch: getDefaultSearch(),
  isEditingSearchSaved: false,
  savedSearches: undefined,
  searchSongTableColumns: undefined,
  getDefaultSearch: getDefaultSearch,
  pullSearchSongs: async (profile: MpdProfile, search: Search) => {
    get().setIsSongTableLoading(true);

    const searchConditions = SearchUtils.convertSearchToConditions(search);
    const songsList = await Promise.all(
      searchConditions.map((searchCondition) => {
        let res = undefined;
        const mpdConditions = searchCondition.mpdConditions;
        if (mpdConditions.length > 0) {
          const req = MpdRequest.create({
            profile,
            command: { $case: "search", search: { conditions: mpdConditions } },
          });
          res = MpdUtils.command(req);
        } else {
          const req = MpdRequest.create({
            profile,
            command: { $case: "listAllSongs", listAllSongs: {} },
          });
          res = MpdUtils.command(req);
        }
        const nonMpdConditions = searchCondition.nonMpdConditions;
        return res.then((v) => {
          let songs: Song[] = [];
          if (v.command?.$case === "search") {
            songs = v.command.search.songs;
          } else if (v.command?.$case === "listAllSongs") {
            songs = v.command.listAllSongs.songs;
          }
          return FilterUtils.filterSongsByAndConditions(
            songs,
            nonMpdConditions,
          );
        });
      }),
    );

    const songs = SearchUtils.mergeSongsList(songsList.map((songs) => songs));
    set({
      searchSongs: songs,
    });
  },
  updateEditingSearch: async (
    search: Search,
    isRestoredFromSavedSearch?: boolean,
  ) => {
    set({
      editingSearch: search,
    });
    if (isRestoredFromSavedSearch !== undefined) {
      set({
        isEditingSearchSaved: isRestoredFromSavedSearch,
      });
    }
  },
  pullSavedSearches: async () => {
    const savedSearches = await ApiUtils.get<SavedSearches>(
      ENDPOINT_APP_SAVED_SEARCHES,
      SavedSearches,
    );
    set({
      savedSearches: savedSearches.searches,
    });
  },
  updateSavedSearches: async (searches: Search[]) => {
    const savedSearches = SavedSearches.create({
      searches,
    });
    await ApiUtils.post<SavedSearches>(
      ENDPOINT_APP_SAVED_SEARCHES,
      SavedSearches,
      savedSearches,
    );
    set({
      savedSearches: searches,
    });
  },
  updateIsEditingSearchSaved: async (isEditing: boolean) => {
    set({
      isEditingSearchSaved: isEditing,
    });
  },
  updateSearchSongTableColumns: async (
    columns: SongTableColumn[] | undefined,
  ) => {
    set({
      searchSongTableColumns: columns,
    });
  },
  updateSearchSongs: (songs: Song[]) => {
    set({
      searchSongs: songs,
    });
  },
});
