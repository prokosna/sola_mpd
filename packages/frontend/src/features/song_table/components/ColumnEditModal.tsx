import {
	ActionIcon,
	Button,
	Divider,
	Group,
	Modal,
	Stack,
} from "@mantine/core";
import type { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";
import type { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { listAllSongMetadataTags } from "@sola_mpd/domain/src/utils/songUtils.js";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { type JSX, useCallback, useEffect, useState } from "react";
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
		<Modal
			opened={props.isOpen}
			centered
			onClose={() => {
				if (props.handleModalDisposed !== undefined) {
					props.handleModalDisposed();
				}
			}}
			title="Edit Columns"
		>
			<Stack>
				<Group wrap="nowrap" justify="space-between">
					<Stack>
						<ColumnEditModalTagListBox
							title="Active Tags"
							selectedTag={selectedActiveTag}
							tags={activeTagsState}
							handleTagSelected={handleActiveTagSelected}
						/>
					</Stack>
					<Stack>
						<ActionIcon variant="outline" onClick={handleItemMovedToInactive}>
							<IconArrowRight />
						</ActionIcon>
						<ActionIcon variant="outline" onClick={handleItemMovedToActive}>
							<IconArrowLeft />
						</ActionIcon>
					</Stack>
					<Stack>
						<ColumnEditModalTagListBox
							title="Inactive Tags"
							selectedTag={selectedInactiveTag}
							tags={inactiveTags}
							handleTagSelected={handleInactiveTagSelected}
						/>
					</Stack>
				</Group>
			</Stack>
			<Divider my={8} />
			<Group justify="flex-end">
				<Button mr={3} onClick={handleSubmit}>
					OK
				</Button>
				<Button color="gray" onClick={props.handleModalDisposed}>
					Cancel
				</Button>
			</Group>
		</Modal>
	);
}
