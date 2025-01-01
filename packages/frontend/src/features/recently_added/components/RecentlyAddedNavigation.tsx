import { VStack, useColorMode } from "@chakra-ui/react";
import { Allotment } from "allotment";

import { FullWidthSkeleton } from "../../loading";
import { useRecentlyAddedFiltersState } from "../states/recentlyAddedFiltersState";
import { listRecentlyAddedSongMetadataTags } from "../utils/recentlyAddedFilterUtils";

import { RecentlyAddedNavigationFilter } from "./RecentlyAddedNavigationFilter";

/**
 * Renders the navigation component for the recently added feature.
 * This component displays a list of filters for browsing music content.
 * It uses the recently added filters state to dynamically render filter components
 * and handles the case when filters are not yet loaded.
 */
export function RecentlyAddedNavigation() {
  const recentlyAddedFilters = useRecentlyAddedFiltersState();
  const { colorMode } = useColorMode();

  if (recentlyAddedFilters === undefined) {
    return (
      <FullWidthSkeleton className="layout-border-top layout-border-left" />
    );
  }

  const usedTags = recentlyAddedFilters.map((filter) => filter.tag);
  const availableTags = listRecentlyAddedSongMetadataTags().filter(
    (tag) => !usedTags.includes(tag),
  );

  return (
    <>
      <VStack h="full" spacing={0}>
        <Allotment
          className={
            colorMode === "light" ? "allotment-light" : "allotment-dark"
          }
          vertical={true}
        >
          {recentlyAddedFilters.map((recentlyAddedFilter, index) => (
            <Allotment.Pane key={index} minSize={20}>
              <RecentlyAddedNavigationFilter
                key={index}
                {...{ recentlyAddedFilter, availableTags }}
              />
            </Allotment.Pane>
          ))}
        </Allotment>
      </VStack>
    </>
  );
}
