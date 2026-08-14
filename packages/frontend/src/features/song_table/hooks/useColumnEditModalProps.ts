import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { useCallback } from "react";

import type { ColumnEditModalProps } from "../components/ColumnEditModal";

export function useColumnEditModalProps(
	isOpen: boolean,
	tags: Song_MetadataTag[],
	setIsOpenColumnEditModal: (open: boolean) => void,
	onTagsUpdated: (tags: Song_MetadataTag[]) => void,
	onModalDisposed: () => void,
): ColumnEditModalProps {
	const handleTagsUpdated = useCallback(
		async (newTags: Song_MetadataTag[]) => {
			onTagsUpdated(newTags);
			setIsOpenColumnEditModal(false);
		},
		[onTagsUpdated, setIsOpenColumnEditModal],
	);

	const handleModalDisposed = useCallback(async () => {
		onModalDisposed();
		setIsOpenColumnEditModal(false);
	}, [onModalDisposed, setIsOpenColumnEditModal]);

	return {
		tags,
		isOpen,
		handleTagsUpdated,
		handleModalDisposed,
	};
}
