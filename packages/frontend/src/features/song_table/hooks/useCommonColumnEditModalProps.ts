import {
  SongTableColumn,
  SongTableState,
} from "@sola_mpd/domain/src/models/song_table_pb.js";

import { ColumnEditModalProps } from "../components/ColumnEditModal";

import { useColumnEditModal } from "./useColumnEditModal";

export function useCommonColumnEditModalProps(
  commonSongTableState: SongTableState,
  updateCommonSongTableColumnsAction: (
    newColumns: SongTableColumn[],
  ) => Promise<void>,
): ColumnEditModalProps {
  const onClickOk = (newColumns: SongTableColumn[]) => {
    updateCommonSongTableColumnsAction(newColumns);
  };

  const onClickCancel = () => {};

  const props = useColumnEditModal(
    commonSongTableState,
    commonSongTableState.columns,
    onClickOk,
    onClickCancel,
  );

  return props;
}
