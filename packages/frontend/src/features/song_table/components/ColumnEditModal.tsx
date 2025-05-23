import {
	Button,
	Center,
	HStack,
	IconButton,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	VStack,
} from "@chakra-ui/react";
import type { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";
import type { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { listAllSongMetadataTags } from "@sola_mpd/domain/src/utils/songUtils.js";
import { useCallback, useEffect, useState } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

import {
	copySortingAttributesToNewColumns,
	ensureTagsContainedInColumns,
	getAverageWidthFlex,
	normalizeSongTableColumns,
} from "../utils/songTableColumnUtils";

import { ColumnEditModalTagListBox } from "./ColumnEditModalTagListBox";

export type ColumnEditModalProps = {
	columns: SongTableColumn[];
	isOpen: boolean;
	handleColumnsUpdated: (newColumns: SongTableColumn[]) => Promise<void>;
	handleModalDisposed: () => Promise<void>;
};

/**
 * Modal interface for customizing song table columns.
 *
 * Provides drag-and-drop functionality for reordering columns and
 * managing which metadata tags are displayed. Maintains column
 * widths and sorting configurations during updates.
 *
 * @param props.columns Current columns configuration
 * @param props.isOpen Modal visibility state
 * @param props.handleColumnsUpdated Column update callback
 * @param props.handleModalDisposed Modal close callback
 */
export function ColumnEditModal(props: ColumnEditModalProps): JSX.Element {
	// Available tags in use
	const [activeTagsState, setActiveTagsState] = useState<Song_MetadataTag[]>(
		[],
	);
	useEffect(() => {
		if (props.isOpen) {
			setActiveTagsState(props.columns.map((column) => column.tag));
		}
	}, [props.columns, props.isOpen]);

	const [selectedActiveTag, setSelectedActiveTag] = useState<
		Song_MetadataTag | undefined
	>(undefined);

	// Available tags not in use
	const inactiveTags = listAllSongMetadataTags().filter(
		(v) => !activeTagsState.includes(v),
	);
	const [selectedInactiveTag, setSelectedInactiveTag] = useState<
		Song_MetadataTag | undefined
	>(undefined);

	// Handlers
	const handleActiveTagSelected = useCallback((tag: Song_MetadataTag) => {
		setSelectedActiveTag(tag);
		setSelectedInactiveTag(undefined);
	}, []);
	const handleInactiveTagSelected = useCallback((tag: Song_MetadataTag) => {
		setSelectedInactiveTag(tag);
		setSelectedActiveTag(undefined);
	}, []);
	const handleItemMovedToActive = useCallback(() => {
		if (selectedInactiveTag !== undefined) {
			setActiveTagsState([...activeTagsState, selectedInactiveTag]);
			setSelectedInactiveTag(undefined);
		}
	}, [activeTagsState, selectedInactiveTag]);
	const handleItemMovedToInactive = useCallback(() => {
		if (selectedActiveTag !== undefined) {
			setActiveTagsState(
				activeTagsState.filter((tag) => tag !== selectedActiveTag),
			);
			setSelectedActiveTag(undefined);
		}
	}, [activeTagsState, selectedActiveTag]);

	const handleSubmit = useCallback(() => {
		// Remove inactive tags from the columns.
		const normalizedColumns = normalizeSongTableColumns(
			props.columns.filter((column) => activeTagsState.includes(column.tag)),
		);

		// Add missing columns.
		const averageWidthFlex = getAverageWidthFlex(normalizedColumns);
		const activeColumns = ensureTagsContainedInColumns(
			normalizedColumns,
			activeTagsState,
			averageWidthFlex,
		);

		const newColumns = copySortingAttributesToNewColumns(
			activeColumns,
			props.columns,
		);

		props.handleColumnsUpdated(newColumns);
	}, [activeTagsState, props]);

	return (
		<>
			<Modal
				isCentered
				closeOnOverlayClick={false}
				isOpen={props.isOpen}
				onClose={() => {
					if (props.handleModalDisposed !== undefined) {
						props.handleModalDisposed();
					}
				}}
			>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Edit columns</ModalHeader>
					<ModalBody pb={6}>
						<Center>
							<HStack>
								<VStack>
									<ColumnEditModalTagListBox
										title="Active Tags"
										selectedTag={selectedActiveTag}
										tags={activeTagsState}
										handleTagSelected={handleActiveTagSelected}
									/>
								</VStack>
								<VStack>
									<IconButton
										aria-label={"Move a selected item to inactive"}
										icon={<IoChevronForward />}
										onClick={handleItemMovedToInactive}
									/>
									<IconButton
										aria-label={"Move a selected item to active"}
										icon={<IoChevronBack />}
										onClick={handleItemMovedToActive}
									/>
								</VStack>
								<VStack>
									<ColumnEditModalTagListBox
										title="Inactive Tags"
										selectedTag={selectedInactiveTag}
										tags={inactiveTags}
										handleTagSelected={handleInactiveTagSelected}
									/>
								</VStack>
							</HStack>
						</Center>
					</ModalBody>

					<ModalFooter>
						<Button colorScheme="brand" mr={3} onClick={handleSubmit}>
							OK
						</Button>
						<Button onClick={props.handleModalDisposed} colorScheme="gray">
							Cancel
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
}
