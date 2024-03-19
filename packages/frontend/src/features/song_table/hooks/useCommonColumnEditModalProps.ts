import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { useCallback } from "react";

import { ColumnEditModalProps } from "../components/ColumnEditModal";
import {
  useCommonSongTableState,
  useSetCommonSongTableState,
} from "../states/commonSongTableState";

import { useColumnEditModalProps } from "./useColumnEditModalProps";

export function useCommonColumnEditModalProps(
  isOpen: boolean,
  setIsOpenColumnEditModal: (open: boolean) => void,
): ColumnEditModalProps | undefined {
  const commonSongTableState = useCommonSongTableState();
  const setCommonSongTableState = useSetCommonSongTableState();

  const onClickOk = useCallback(
    (newColumns: SongTableColumn[]) => {
      if (commonSongTableState === undefined) {
        setIsOpenColumnEditModal(false);
        return;
      }
      const newCommonSongTableState = commonSongTableState.clone();
      newCommonSongTableState.columns = newColumns;
      setCommonSongTableState(newCommonSongTableState);
    },
    [commonSongTableState, setIsOpenColumnEditModal, setCommonSongTableState],
  );

  const onClickCancel = useCallback(() => {}, []);

  const props = useColumnEditModalProps(
    isOpen,
    setIsOpenColumnEditModal,
    commonSongTableState?.columns,
    onClickOk,
    onClickCancel,
  );

  return props;
}
