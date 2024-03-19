import { Box } from "@chakra-ui/react";
import { BrowserFilter } from "@sola_mpd/domain/src/models/browser_pb.js";
import { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";

import { FullWidthSkeleton } from "../../loading";
import { SelectList } from "../../select_list";
import { useBrowserNavigationFilterSelectListProps } from "../hooks/useBrowserNavigationFilterSelectListProps";

type BrowserNavigationFilterProps = {
  browserFilter: BrowserFilter;
  availableTags: Song_MetadataTag[];
};

export function BrowserNavigationFilter(props: BrowserNavigationFilterProps) {
  const { browserFilter, availableTags } = props;

  const selectListProps = useBrowserNavigationFilterSelectListProps(
    browserFilter,
    availableTags,
  );

  if (selectListProps === undefined) {
    return <FullWidthSkeleton />;
  }

  return (
    <>
      <Box w="100%" h="full">
        <SelectList {...selectListProps} />
      </Box>
    </>
  );
}
