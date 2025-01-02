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
 * Single filter in navigation.
 *
 * @param props Component props
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
