import { VStack, useColorMode } from "@chakra-ui/react";
import { Allotment } from "allotment";

import { SearchNavigationQueryEditor } from "./SearchNavigationQueryEditor";
import { SearchNavigationSavedQueries } from "./SearchNavigationSavedQueries";

/**
 * SearchNavigation component renders the navigation section of the search feature.
 * It includes the query editor and saved queries components.
 * @returns JSX element representing the SearchNavigation component
 */
export function SearchNavigation() {
  const { colorMode } = useColorMode();

  return (
    <>
      <VStack h="full" spacing={0}>
        <Allotment
          className={
            colorMode === "light" ? "allotment-light" : "allotment-dark"
          }
          vertical={true}
        >
          <Allotment.Pane minSize={20}>
            <SearchNavigationQueryEditor />
          </Allotment.Pane>
          <Allotment.Pane minSize={20}>
            <SearchNavigationSavedQueries />
          </Allotment.Pane>
        </Allotment>
      </VStack>
    </>
  );
}
