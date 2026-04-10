import type { SongTableColumn } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { useCallback } from "react";

import type { ColumnEditModalProps } from "../components/ColumnEditModal";

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
