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

/**
 * Individual filter component for the browser navigation.
 *
 * Features:
 * - Selectable list of filter options
 * - Dynamic metadata tag filtering
 * - Loading state handling
 * - Full-width layout integration
 *
 * @component
 * @param props.browserFilter - Current browser filter configuration
 * @param props.availableTags - List of available metadata tags
 */
export function BrowserNavigationFilter(props: BrowserNavigationFilterProps) {
  const { browserFilter, availableTags } = props;

  const selectListProps = useBrowserNavigationFilterSelectListProps(
    browserFilter,
    availableTags,
  );

  if (selectListProps === undefined) {
    return (
      <FullWidthSkeleton className="layout-border-top layout-border-left" />
    );
  }

  return (
    <>
      <Box w="100%" h="full">
        <SelectList {...selectListProps} />
      </Box>
    </>
  );
}
