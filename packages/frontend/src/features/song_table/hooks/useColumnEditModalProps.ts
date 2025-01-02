import type { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { useCallback } from "react";

import type { ColumnEditModalProps } from "../components/ColumnEditModal";

/**
 * Creates props for column edit modal component.
 *
 * Manages modal state and column updates, ensuring proper cleanup
 * and state synchronization when changes are made or modal is
 * closed.
 *
 * @param isOpen Modal visibility
 * @param columns Current columns
 * @param setIsOpenColumnEditModal Modal state setter
 * @param onColumnsUpdated Column update handler
 * @param onModalDisposed Modal cleanup handler
 * @returns Modal component props
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
