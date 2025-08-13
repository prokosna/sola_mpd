import { Box, Flex, Text } from "@chakra-ui/react";

import { FullWidthSkeleton } from "../../loading";
import { SelectList } from "../../select_list";
import { useSavedSearchesSelectListProps } from "../hooks/useSavedSearchesSelectListProps";

/**
 * List of saved searches.
 *
 * Uses SelectList for display and loading states.
 *
 * @returns Saved queries component
 */
export function SearchNavigationSavedQueries() {
	const selectListProps = useSavedSearchesSelectListProps();

	if (selectListProps === undefined) {
		return <FullWidthSkeleton />;
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
