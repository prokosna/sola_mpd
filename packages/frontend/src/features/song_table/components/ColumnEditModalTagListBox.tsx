import { Box, Button, List, ListItem, Text } from "@chakra-ui/react";
import { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";

import { convertSongMetadataTagToDisplayName } from "../helpers/table";

export type ColumnEditModalTagListBoxProps = {
  title: string;
  selectedTag?: Song_MetadataTag;
  tags: Song_MetadataTag[];
  onClick: (tag: Song_MetadataTag) => void;
};

export function ColumnEditModalTagListBox(
  props: ColumnEditModalTagListBoxProps,
) {
  const { title, selectedTag, tags, onClick } = props;

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
                  onClick={() => onClick(tag)}
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
