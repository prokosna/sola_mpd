import { Box, Button, List, ListItem, Text } from "@chakra-ui/react";
import type { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";

import { convertSongMetadataTagToDisplayName } from "../utils/songTableTableUtils";

export type ColumnEditModalTagListBoxProps = {
	title: string;
	selectedTag?: Song_MetadataTag;
	tags: Song_MetadataTag[];
	handleTagSelected: (tag: Song_MetadataTag) => void;
};

/**
 * Scrollable list box for selecting song metadata tags.
 *
 * Displays available metadata tags with visual selection state
 * and hover effects. Used within the column edit modal for
 * configuring table columns.
 *
 * @param props.title List box title
 * @param props.selectedTag Currently selected tag
 * @param props.tags Available tags
 * @param props.handleTagSelected Selection callback
 */
export function ColumnEditModalTagListBox(
	props: ColumnEditModalTagListBoxProps,
): JSX.Element {
	const { title, selectedTag, tags, handleTagSelected } = props;

	return (
		<>
			<Text>{title}</Text>
			<Box className="layout-border-all" w="180px" h="200px" overflow={"auto"}>
				<List>
					{tags.map((tag) => {
						const isSelected = tag === selectedTag;
						return (
							<ListItem key={tag}>
								<Button
									ml={2}
									w="90%"
									variant={isSelected ? "solid" : "ghost"}
									_hover={{
										variant: "outline",
									}}
									onClick={() => handleTagSelected(tag)}
								>
									{convertSongMetadataTagToDisplayName(tag)}
								</Button>
							</ListItem>
						);
					})}
				</List>
			</Box>
		</>
	);
}
