import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { useCallback } from "react";

import { ColumnEditModalProps } from "../components/ColumnEditModal";

/**
 * Uses props for ColumnEditModal.
 * @param isOpen True if the modal is open.
 * @param columns Current columns to edit.
 * @param setIsOpenColumnEditModal Function to set isOpen.
 * @param onColumnsUpdated Function to update columns.
 * @param onModalDisposed Function to dispose the modal.
 * @returns Props.
 */
export function useColumnEditModalProps(
  isOpen: boolean,
  columns: SongTableColumn[],
  setIsOpenColumnEditModal: (open: boolean) => void,
  onColumnsUpdated: (columns: SongTableColumn[]) => void,
  onModalDisposed: () => void,
): ColumnEditModalProps {
  const handleColumnsUpdated = useCallback(
    async (newColumns: SongTableColumn[]) => {
      onColumnsUpdated(newColumns);
      // Close the modal after updating the columns.
      setIsOpenColumnEditModal(false);
    },
    [onColumnsUpdated, setIsOpenColumnEditModal],
  );

  const handleModalDisposed = useCallback(async () => {
    onModalDisposed();
    // Make sure to close the modal.
    setIsOpenColumnEditModal(false);
  }, [onModalDisposed, setIsOpenColumnEditModal]);

  return {
    columns,
    isOpen,
    handleColumnsUpdated,
    handleModalDisposed,
  };
}
