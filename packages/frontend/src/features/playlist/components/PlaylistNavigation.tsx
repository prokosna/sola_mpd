import { Box } from "@chakra-ui/react";

import { FullWidthSkeleton } from "../../loading";
import { SelectList } from "../../select_list";
import { usePlaylistNavigationSelectListProps } from "../hooks/usePlaylistNavigationSelectListProps";

/**
 * PlaylistNavigation component
 *
 * This component renders the navigation for playlists.
 * It uses the SelectList component to display the list of playlists
 * and handles the loading state with a FullWidthSkeleton.
 *
 * @returns The rendered PlaylistNavigation component
 */
export function PlaylistNavigation() {
  const selectListProps = usePlaylistNavigationSelectListProps();

  if (selectListProps === undefined) {
    return (
      <FullWidthSkeleton className="layout-border-top layout-border-left" />
    );
  }

  return (
    <>
      <Box className="layout-border-left" w="100%" h="full">
        <SelectList {...selectListProps} />
      </Box>
    </>
  );
}
