import {
  SongTableColumn,
  SongTableState,
} from "@sola_mpd/domain/src/models/song_table_pb.js";
import { useSetAtom } from "jotai";

import { publishCommonSongTableStateChangedEventAtom } from "../atoms/commonSongTableState";

export function useUpdateCommonSongTableColumnsAction() {
  const publishCommonSongTableStateChangedEvent = useSetAtom(
    publishCommonSongTableStateChangedEventAtom,
  );

  return (commonSongTableState: SongTableState) =>
    async (newColumns: SongTableColumn[]) => {
      const newCommonSongTableState = commonSongTableState.clone();
      newCommonSongTableState.columns = newColumns;
      publishCommonSongTableStateChangedEvent(newCommonSongTableState);
    };
}
