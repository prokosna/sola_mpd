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
 * Renders a navigation filter component for the browser.
 * This component displays a selectable list of filter options based on the provided browser filter and available tags.
 *
 * @param {BrowserNavigationFilterProps} props - The component props
 * @param {BrowserFilter} props.browserFilter - The current browser filter
 * @param {Song_MetadataTag[]} props.availableTags - Array of available metadata tags
 * @returns {JSX.Element} The rendered BrowserNavigationFilter component
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
