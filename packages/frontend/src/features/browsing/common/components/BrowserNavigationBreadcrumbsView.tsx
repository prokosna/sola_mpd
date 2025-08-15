import type { BrowserFilter } from "@sola_mpd/domain/src/models/browser_pb.js";
import { convertSongMetadataValueToString } from "@sola_mpd/domain/src/utils/songUtils.js";
import { useCallback, useMemo } from "react";

import {
	ActionIcon,
	Badge,
	Breadcrumbs,
	Group,
	Tooltip,
	useComputedColorScheme,
} from "@mantine/core";
import { IconX } from "@tabler/icons-react";
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
	const scheme = useComputedColorScheme();

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
			<Group
				w="100%"
				h="100%"
				justify="space-between"
				bg={scheme === "dark" ? "dark.9" : "brand.1"}
			>
				<Group>
					<ActionIcon
						variant="transparent"
						c="gray.5"
						size="md"
						onClick={handleResetClick}
					>
						<IconX />
					</ActionIcon>
				</Group>

				<Group justify="center" flex={1}>
					<Breadcrumbs separator=">" separatorMargin="xs">
						{selectedBrowserFilters.map((browserFilter) => (
							<Group key={`breadcrumb_item_${browserFilter.tag}`} gap={0}>
								{browserFilter.selectedValues.map((value) => (
									<Tooltip
										key={convertSongMetadataValueToString(value)}
										label={convertSongMetadataValueToString(value)}
										withArrow
									>
										<Badge
											c="brand"
											variant="outline"
											size="xs"
											maw={150}
											rightSection={
												<ActionIcon
													size="xs"
													color="gray.5"
													variant="transparent"
													onClick={() =>
														handleCloseClick(
															browserFilter,
															convertSongMetadataValueToString(value),
														)
													}
												>
													<IconX />
												</ActionIcon>
											}
										>
											{convertSongMetadataValueToString(value)}
										</Badge>
									</Tooltip>
								))}
							</Group>
						))}
					</Breadcrumbs>
				</Group>
			</Group>
		</>
	);
}
