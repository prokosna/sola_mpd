import {
	Breadcrumb,
	BreadcrumbItem,
	Center,
	Flex,
	IconButton,
	Tag,
	TagCloseButton,
	TagLabel,
	Tooltip,
} from "@chakra-ui/react";
import type { BrowserFilter } from "@sola_mpd/domain/src/models/browser_pb.js";
import { convertSongMetadataValueToString } from "@sola_mpd/domain/src/utils/songUtils.js";
import { useCallback, useMemo } from "react";
import { IoChevronForward, IoClose } from "react-icons/io5";

import { UpdateMode } from "../../../types/stateTypes";
import {
	useBrowserFiltersState,
	useUpdateBrowserFiltersState,
} from "../states/browserFiltersState";
import {
	resetAllBrowserFilters,
	selectBrowserFilterValues,
} from "../utils/browserFilterUtils";

/**
 * Breadcrumb navigation component for visualizing and managing browser filters.
 *
 * Features:
 * - Interactive breadcrumb trail of active filters
 * - Filter removal via individual close buttons
 * - Global reset functionality
 * - Ordered display based on selection sequence
 * - Tooltip support for long filter values
 *
 * @component
 */
export function BrowserNavigationBreadcrumbs() {
	const browserFilters = useBrowserFiltersState();
	const updateBrowserFilters = useUpdateBrowserFiltersState();
	const selectedBrowserFilters = useMemo(
		() =>
			browserFilters
				?.filter((filter) => filter.selectedValues.length > 0)
				.toSorted((a, b) => a.selectedOrder - b.selectedOrder),
		[browserFilters],
	);

	const handleResetClick = useCallback(() => {
		if (browserFilters === undefined) {
			return;
		}
		const newFilters = resetAllBrowserFilters(browserFilters);
		updateBrowserFilters(
			newFilters,
			UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
		);
	}, [browserFilters, updateBrowserFilters]);

	const handleCloseClick = useCallback(
		(browserFilter: BrowserFilter, value: string) => {
			if (browserFilters === undefined) {
				return;
			}
			const selectedValues = browserFilter.selectedValues.map((selectedValue) =>
				convertSongMetadataValueToString(selectedValue),
			);
			const index = selectedValues.findIndex(
				(selectedValue) => selectedValue === value,
			);
			if (index < 0) {
				return;
			}
			selectedValues.splice(index, 1);
			const newFilters = selectBrowserFilterValues(
				browserFilters,
				browserFilter,
				selectedValues,
			);
			updateBrowserFilters(
				newFilters,
				UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
			);
		},
		[browserFilters, updateBrowserFilters],
	);

	if (
		selectedBrowserFilters === undefined ||
		selectedBrowserFilters.length === 0
	) {
		return null;
	}

	return (
		<>
			<Flex className="layout-border-top layout-border-left">
				<Center w="25px" px="1px">
					<IconButton
						variant="ghost"
						colorScheme="gray"
						aria-label="Reset filters"
						size="xs"
						onClick={handleResetClick}
						icon={<IoClose />}
					/>
				</Center>
				<Center px={5} py={1} w={"calc(100% - 27px)"} overflow={"auto"}>
					<Breadcrumb spacing="8px" separator={<IoChevronForward />}>
						{selectedBrowserFilters.map((browserFilter) => (
							<BreadcrumbItem key={`breadcrumb_item_${browserFilter.tag}`}>
								{browserFilter.selectedValues.map((value) => (
									<Tooltip
										key={convertSongMetadataValueToString(value)}
										hasArrow
										label={convertSongMetadataValueToString(value)}
									>
										<Tag
											key={convertSongMetadataValueToString(value)}
											className="browser-breadcrumbs-tag"
											size={"sm"}
											borderRadius="full"
											variant="outline"
											maxWidth="200px"
											minWidth="50px"
										>
											<TagLabel className="browser-breadcrumbs-tag-label">
												{convertSongMetadataValueToString(value)}
											</TagLabel>
											<TagCloseButton
												onClick={() =>
													handleCloseClick(
														browserFilter,
														convertSongMetadataValueToString(value),
													)
												}
											/>
										</Tag>
									</Tooltip>
								))}
							</BreadcrumbItem>
						))}
					</Breadcrumb>
				</Center>
			</Flex>
		</>
	);
}
