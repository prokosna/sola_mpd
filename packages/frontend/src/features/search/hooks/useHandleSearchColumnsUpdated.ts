import { Search } from "@sola_mpd/domain/src/models/search_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { useCallback } from "react";

import { useSetEditingSearchState } from "../states/searchEditState";
import { EditingSearchStatus } from "../types/searchTypes";
import { changeEditingSearchColumns } from "../utils/searchUtils";

/**
 * Hook for handling search column updates.
 *
 * Updates editing search with new columns.
 *
 * @returns Column update handler
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
