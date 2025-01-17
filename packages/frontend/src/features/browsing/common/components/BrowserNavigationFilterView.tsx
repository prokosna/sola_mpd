import { Box } from "@chakra-ui/react";
import type { BrowserFilter } from "@sola_mpd/domain/src/models/browser_pb.js";
import type { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";

import type { UpdateMode } from "../../../../types/stateTypes";
import { FullWidthSkeleton } from "../../../loading";
import { SelectList } from "../../../select_list";
import { useBrowserNavigationFilterSelectListProps } from "../hooks/useBrowserNavigationFilterSelectListProps";

export type BrowserNavigationFilterViewProps = {
	browserFilter: BrowserFilter;
	values?: string[];
	browserFilters?: BrowserFilter[];
	availableTags: Song_MetadataTag[];
	updateBrowserFilters: (
		browserFilters: BrowserFilter[],
		mode: UpdateMode,
	) => Promise<void>;
};

/**
 * Renders a filter view for browser navigation.
 *
 * This component displays a list of selectable items for a specific browser filter.
 * It uses the SelectList component to render the filter options and handles
 * the loading state with a skeleton placeholder.
 *
 * @param props Contains the necessary data and functions for the filter view
 * @returns A React component displaying the browser navigation filter
 */
export function BrowserNavigationFilterView(
	props: BrowserNavigationFilterViewProps,
) {
	const selectListProps = useBrowserNavigationFilterSelectListProps(props);

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
