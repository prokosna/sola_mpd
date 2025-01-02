import { VStack, useColorMode } from "@chakra-ui/react";
import { Allotment } from "allotment";

import { FullWidthSkeleton } from "../../loading";
import { useBrowserFiltersState } from "../states/browserFiltersState";
import { listBrowserSongMetadataTags } from "../utils/browserFilterUtils";

import { BrowserNavigationFilter } from "./BrowserNavigationFilter";

/**
 * Navigation component for browsing music content with dynamic filters.
 *
 * Features:
 * - Dynamic filter list based on metadata tags
 * - Resizable filter panels with drag handles
 * - Loading state handling with skeleton UI
 * - Color mode support for light/dark themes
 * - Automatic filter availability management
 *
 * @component
 */
export function BrowserNavigation() {
  const browserFilters = useBrowserFiltersState();
  const { colorMode } = useColorMode();

  if (browserFilters === undefined) {
    return (
      <FullWidthSkeleton className="layout-border-top layout-border-left" />
    );
  }

  const usedTags = browserFilters.map((filter) => filter.tag);
  const availableTags = listBrowserSongMetadataTags().filter(
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
          {browserFilters
            .sort((a, b) => a.order - b.order)
            .map((browserFilter, index) => (
              <Allotment.Pane key={index} minSize={20}>
                <BrowserNavigationFilter
                  key={index}
                  {...{ browserFilter, availableTags }}
                />
              </Allotment.Pane>
            ))}
        </Allotment>
      </VStack>
    </>
  );
}
