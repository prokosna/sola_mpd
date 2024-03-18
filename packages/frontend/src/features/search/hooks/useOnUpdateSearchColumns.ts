import { Search } from "@sola_mpd/domain/src/models/search_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { useCallback } from "react";

import { changeEditingSearchColumns } from "../helpers/search";
import { useSetEditingSearchState } from "../states/edit";
import { EditingSearchStatus } from "../types/search";

export function useOnUpdateSearchColumns(editingSearch: Search) {
  const setEditingSearch = useSetEditingSearchState();

  return useCallback(
    async (columns: SongTableColumn[]) => {
      const newSearch = changeEditingSearchColumns(editingSearch, columns);
      setEditingSearch(newSearch, EditingSearchStatus.COLUMNS_UPDATED);
    },
    [editingSearch, setEditingSearch],
  );
}
