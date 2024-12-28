import { VStack, useColorMode } from "@chakra-ui/react";
import { Allotment } from "allotment";

import { FullWidthSkeleton } from "../../loading";
import { useBrowserFiltersState } from "../states/browserFiltersState";
import { listBrowserSongMetadataTags } from "../utils/browserFilterUtils";

import { BrowserNavigationFilter } from "./BrowserNavigationFilter";

/**
 * Renders the navigation component for the browser feature.
 * This component displays a list of filters for browsing music content.
 * It uses the browser filters state to dynamically render filter components
 * and handles the case when filters are not yet loaded.
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
