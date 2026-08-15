import { useCallback } from "react";

import { COMPONENT_ID_BROWSER_FILTER_LIST_PREFIX } from "../../../../const/component";
import type { ContextMenuSection } from "../../../context_menu";
import type {
	SelectListContextMenuItemParams,
	SelectListProps,
} from "../../../select_list";
import { convertSongMetadataTagToDisplayName } from "../../../song_table";
import type { BrowserNavigationFilterViewProps } from "../components/BrowserNavigationFilterView";
import {
	addBrowserFilterNext,
	changeBrowserFilterToTheOtherTag,
	removeBrowserFilter,
	selectBrowserFilterValues,
} from "../functions/browserFilter";

export function useBrowserNavigationFilterSelectListProps(
	props: BrowserNavigationFilterViewProps,
): SelectListProps | undefined {
	const {
		browserFilter,
		values,
		browserFilters,
		availableTags,
		updateBrowserFilters,
		onScrolledNearBottom,
	} = props;

	const onItemsSelected = useCallback(
		async (selectedValues: string[]) => {
			if (browserFilters === undefined) {
				return;
			}

			const currentSelectedValuesSet = new Set(browserFilter.selectedValues);
			const selectedValuesSet = new Set(selectedValues);
			if (
				currentSelectedValuesSet.size === selectedValuesSet.size &&
				[...currentSelectedValuesSet].every((v) => selectedValuesSet.has(v))
			) {
				return;
			}

			const newFilters = selectBrowserFilterValues(
				browserFilters,
				browserFilter,
				selectedValues,
			);
			await updateBrowserFilters(newFilters);
		},
		[browserFilter, browserFilters, updateBrowserFilters],
	);

	const onLoadingCompleted = useCallback(async () => {}, []);

	if (values === undefined || browserFilters === undefined) {
		return undefined;
	}

	const contextMenuSections: ContextMenuSection<SelectListContextMenuItemParams>[] =
		[
			{
				items: [
					{
						name: "Change to",
						subItems: availableTags.map((tag) => ({
							name: convertSongMetadataTagToDisplayName(tag),
							onClick: async (params) => {
								if (params === undefined) {
									return;
								}
								const newFilters = changeBrowserFilterToTheOtherTag(
									browserFilters,
									browserFilter,
									tag,
								);
								await updateBrowserFilters(newFilters);
							},
						})),
					},
				],
			},
		];
	if (availableTags.length !== 0) {
		contextMenuSections[0].items.push({
			name: "Add Panel Below",
			onClick: async (params) => {
				if (params === undefined) {
					return;
				}
				const newFilters = addBrowserFilterNext(
					browserFilters,
					browserFilter,
					availableTags[0],
				);
				await updateBrowserFilters(newFilters);
			},
		});
	}
	if (browserFilters.length > 1) {
		contextMenuSections[0].items.push({
			name: "Remove Panel",
			onClick: async (params) => {
				if (params === undefined) {
					return;
				}
				const newFilters = removeBrowserFilter(browserFilters, browserFilter);
				await updateBrowserFilters(newFilters);
			},
		});
	}

	return {
		id: `${COMPONENT_ID_BROWSER_FILTER_LIST_PREFIX}_${browserFilter.tag}`,
		values,
		selectedValues: browserFilter.selectedValues,
		headerTitle: convertSongMetadataTagToDisplayName(browserFilter.tag),
		contextMenuSections,
		isLoading: false,
		allowMultipleSelection: true,
		onItemsSelected,
		onLoadingCompleted,
		onScrolledNearBottom,
	};
}
