import { Card, NavLink, ScrollArea, Text } from "@mantine/core";
import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import type { JSX } from "react";
import { convertSongMetadataTagToDisplayName } from "../functions/songTableConversion";

export type ColumnEditModalTagListBoxProps = {
	title: string;
	selectedTag?: Song_MetadataTag;
	tags: Song_MetadataTag[];
	handleTagSelected: (tag: Song_MetadataTag) => void;
};

export function ColumnEditModalTagListBox(
	props: ColumnEditModalTagListBoxProps,
): JSX.Element {
	const { title, selectedTag, tags, handleTagSelected } = props;

	return (
		<>
			<Text>{title}</Text>
			<Card w="170" h="200" withBorder>
				<ScrollArea w="100%" h="100%">
					{tags.map((tag) => {
						const isSelected = tag === selectedTag;
						return (
							<NavLink
								key={tag}
								label={convertSongMetadataTagToDisplayName(tag)}
								active={isSelected}
								onClick={() => handleTagSelected(tag)}
								p={2}
							/>
						);
					})}
				</ScrollArea>
			</Card>
		</>
	);
}
