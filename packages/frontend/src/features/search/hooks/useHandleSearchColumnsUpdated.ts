import { Search } from "@sola_mpd/domain/src/models/search_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { useCallback } from "react";

import { useSetEditingSearchState } from "../states/searchEditState";
import { EditingSearchStatus } from "../types/searchTypes";
import { changeEditingSearchColumns } from "../utils/searchUtils";

/**
 * Hook that returns a function to handle updating search columns.
 *
 * This hook creates a callback function that updates the editing search
 * with new columns and sets the editing status to COLUMNS_UPDATED.
 *
 * @returns A function that takes the current editing search and new columns,
 * and updates the search state accordingly.
 */
export function useHandleSearchColumnsUpdated() {
  const setEditingSearch = useSetEditingSearchState();

  return useCallback(
    async (editingSearch: Search, columns: SongTableColumn[]) => {
      const newSearch = changeEditingSearchColumns(editingSearch, columns);
      setEditingSearch(newSearch, EditingSearchStatus.COLUMNS_UPDATED);
    },
    [setEditingSearch],
  );
}
