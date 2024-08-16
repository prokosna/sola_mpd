import { useDisclosure } from "@chakra-ui/react";
import {
  SongTableState,
  SongTableColumn,
} from "@sola_mpd/domain/src/models/song_table_pb.js";

import { ColumnEditModalProps } from "../components/ColumnEditModal";

export function useColumnEditModal(
  songTableState: SongTableState,
  columns: SongTableColumn[],
  updateColumnsAction: (newColumns: SongTableColumn[]) => Promise<void>,
): [ColumnEditModalProps, () => void] {
  const { isOpen, onClose, onOpen } = useDisclosure();

  const onOk = async (newColumns: SongTableColumn[]) => {
    updateColumnsAction(newColumns);
    onClose();
  };

  const onCancel = async () => {
    onClose();
  };

  return [
    {
      columns: columns.length !== 0 ? columns : songTableState.columns,
      isOpen,
      onOk,
      onCancel,
    },
    onOpen,
  ];
}
