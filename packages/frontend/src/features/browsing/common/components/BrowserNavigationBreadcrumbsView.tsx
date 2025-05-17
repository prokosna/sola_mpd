import { Breadcrumb, Center, Flex, IconButton, Tag } from "@chakra-ui/react";
import type { BrowserFilter } from "@sola_mpd/domain/src/models/browser_pb.js";
import { convertSongMetadataValueToString } from "@sola_mpd/domain/src/utils/songUtils.js";
import React, { useCallback, useMemo } from "react";
import { IoChevronForward, IoClose } from "react-icons/io5";

import { Tooltip } from "../../../../components/ui/tooltip";
import { UpdateMode } from "../../../../types/stateTypes";
import {
	resetAllBrowserFilters,
	selectBrowserFilterValues,
} from "../utils/browserFilterUtils";

type BrowserNavigationBreadcrumbsViewProps = {
	browserFilters?: BrowserFilter[];
	updateBrowserFilters: (
		browserFilters: BrowserFilter[],
		mode: UpdateMode,
	) => Promise<void>;
};

/**
 * Renders navigation breadcrumbs for the browser view.
 *
 * This component displays the selected filters as breadcrumbs and provides
 * functionality to reset or modify the current filter selection.
 *
 * @param props.browserFilters - The current set of browser filters
 * @param props.updateBrowserFilters - Function to update the browser filters
 * @returns A React component displaying the browser navigation breadcrumbs
 */
export function BrowserNavigationBreadcrumbsView(
	props: BrowserNavigationBreadcrumbsViewProps,
) {
	const browserFilters = props.browserFilters;
	const updateBrowserFilters = props.updateBrowserFilters;

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
					>
						<IoClose />
					</IconButton>
				</Center>
				<Center px={5} py={1} w={"calc(100% - 27px)"} overflow={"auto"}>
					<Breadcrumb.Root gap="8px">
						<Breadcrumb.List>
							{selectedBrowserFilters.map((browserFilter, index) => (
								<React.Fragment key={`breadcrumb_item_${browserFilter.tag}`}>
									<Breadcrumb.Item>
										{browserFilter.selectedValues.map((value) => (
											<Tooltip
												key={convertSongMetadataValueToString(value)}
												showArrow
												content={convertSongMetadataValueToString(value)}
											>
												<Tag.Root
													key={convertSongMetadataValueToString(value)}
													className="browser-breadcrumbs-tag"
													size={"sm"}
													borderRadius="full"
													variant="outline"
													maxWidth="200px"
													minWidth="50px"
												>
													<Tag.Label className="browser-breadcrumbs-tag-label">
														{convertSongMetadataValueToString(value)}
													</Tag.Label>
													<Tag.CloseTrigger
														onClick={() =>
															handleCloseClick(
																browserFilter,
																convertSongMetadataValueToString(value),
															)
														}
													/>
												</Tag.Root>
											</Tooltip>
										))}
									</Breadcrumb.Item>
									{index < selectedBrowserFilters.length - 1 && (
										<Breadcrumb.Separator>
											<IoChevronForward />
										</Breadcrumb.Separator>
									)}
								</React.Fragment>
							))}
						</Breadcrumb.List>
					</Breadcrumb.Root>
				</Center>
			</Flex>
		</>
	);
}
