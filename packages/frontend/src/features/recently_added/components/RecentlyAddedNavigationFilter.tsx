import { Box } from "@chakra-ui/react";
import { RecentlyAddedFilter } from "@sola_mpd/domain/src/models/recently_added_pb.js";
import { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";

import { FullWidthSkeleton } from "../../loading";
import { SelectList } from "../../select_list";
import { useRecentlyAddedNavigationFilterSelectListProps } from "../hooks/useRecentlyAddedNavigationFilterSelectListProps";

type RecentlyAddedNavigationFilterProps = {
  recentlyAddedFilter: RecentlyAddedFilter;
  availableTags: Song_MetadataTag[];
};

/**
 * Renders a navigation filter component for the recently added view.
 * This component displays a selectable list of filter options based on the provided recently added filter and available tags.
 *
 * @param {RecentlyAddedNavigationFilterProps} props - The component props
 * @param {RecentlyAddedFilter} props.recentlyAddedFilter - The current recently added filter
 * @param {Song_MetadataTag[]} props.availableTags - Array of available metadata tags
 * @returns {JSX.Element} The rendered RecentlyAddedNavigationFilter component
 */
export function RecentlyAddedNavigationFilter(
  props: RecentlyAddedNavigationFilterProps,
) {
  const { recentlyAddedFilter, availableTags } = props;

  const selectListProps = useRecentlyAddedNavigationFilterSelectListProps(
    recentlyAddedFilter,
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
