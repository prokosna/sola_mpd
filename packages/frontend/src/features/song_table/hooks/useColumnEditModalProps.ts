import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { useCallback } from "react";

import { ColumnEditModalProps } from "../components/ColumnEditModal";
import { useCommonSongTableState } from "../states/commonSongTableState";

export function useColumnEditModalProps(
  isOpen: boolean,
  setIsOpenColumnEditModal: (open: boolean) => void,
  columns: SongTableColumn[] | undefined,
  onClickOk: (newColumns: SongTableColumn[]) => void,
  onClickCancel: () => void,
): ColumnEditModalProps | undefined {
  const commonSongTableState = useCommonSongTableState();

  const onOk = useCallback(
    async (newColumns: SongTableColumn[]) => {
      onClickOk(newColumns);
      setIsOpenColumnEditModal(false);
    },
    [onClickOk, setIsOpenColumnEditModal],
  );

  const onCancel = useCallback(async () => {
    onClickCancel();
    setIsOpenColumnEditModal(false);
  }, [onClickCancel, setIsOpenColumnEditModal]);

  if (columns === undefined || commonSongTableState === undefined) {
    return undefined;
  }

  return {
    columns: columns.length !== 0 ? columns : commonSongTableState.columns,
    isOpen,
    onOk,
    onCancel,
  };
}
