import { Box, Button, List, ListItem, Text } from "@chakra-ui/react";
import { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";

import { convertSongMetadataTagToDisplayName } from "../utils/songTableTableUtils";

export type ColumnEditModalTagListBoxProps = {
  title: string;
  selectedTag?: Song_MetadataTag;
  tags: Song_MetadataTag[];
  handleTagSelected: (tag: Song_MetadataTag) => void;
};

/**
 * A component that displays a list of song metadata tags for column editing.
 *
 * @param props - The properties for the ColumnEditModalTagListBox component
 * @param props.title - The title of the list box
 * @param props.selectedTag - The currently selected tag (optional)
 * @param props.tags - An array of Song_MetadataTag to display
 * @param props.handleTagSelected - A function to handle tag selection
 * @returns JSX element representing the ColumnEditModalTagListBox
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
          {tags.map((tag, index) => {
            const isSelected = tag === selectedTag;
            return (
              <ListItem key={index}>
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
