import {
  SongTableState,
  SongTableColumn,
} from "@sola_mpd/domain/src/models/song_table_pb.js";
import { useCallback } from "react";

import { copySortingAttributesToNewColumns } from "../helpers/columns";
import { useSetCommonSongTableState } from "../states/commonSongTableState";

export function useOnUpdateCommonColumns(
  commonSongTableState?: SongTableState,
  isSortingEnabled: boolean = true,
) {
  const setCommonSongTableState = useSetCommonSongTableState();

  return useCallback(
    async (columns: SongTableColumn[]) => {
      if (commonSongTableState === undefined) {
        return;
      }
      const newState = commonSongTableState.clone();
      if (isSortingEnabled) {
        // New columns have sorting attributes.
        newState.columns = columns;
      } else {
        // New columns are missing sorting attributes.
        // So need to copy previous sorting attributes.
        newState.columns = copySortingAttributesToNewColumns(
          columns,
          commonSongTableState.columns,
        );
      }
      await setCommonSongTableState(newState);
    },
    [commonSongTableState, isSortingEnabled, setCommonSongTableState],
  );
}
