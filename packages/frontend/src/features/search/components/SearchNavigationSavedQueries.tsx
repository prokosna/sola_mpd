import { Box, Flex, Text } from "@chakra-ui/react";

import { FullWidthSkeleton } from "../../loading";
import { SelectList } from "../../select_list";
import { useSavedSearchesSelectListProps } from "../hooks/useSavedSearchesSelectListProps";

/**
 * SearchNavigationSavedQueries component displays a list of saved searches.
 * It uses the SelectList component to render the saved searches and handles loading states.
 * @returns JSX element representing the SearchNavigationSavedQueries component
 */
export function SearchNavigationSavedQueries() {
  const selectListProps = useSavedSearchesSelectListProps();

  if (selectListProps === undefined) {
    return (
      <FullWidthSkeleton className="layout-border-top layout-border-left" />
    );
  }

  return (
    <>
      <Box
        className="layout-border-left layout-general-header-bg"
        w="100%"
        h="100%"
      >
        <Flex w="100%" h="49px" alignItems={"center"}>
          <Text as={"b"} px={18}>
            Saved Searches
          </Text>
        </Flex>
        <SelectList {...selectListProps} />
      </Box>
    </>
  );
}
