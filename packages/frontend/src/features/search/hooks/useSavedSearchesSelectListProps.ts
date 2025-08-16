import type { UseFormReturnType } from "@mantine/form";
import { useCallback } from "react";
import { COMPONENT_ID_SEARCH_SIDE_PANE } from "../../../const/component";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import { UpdateMode } from "../../../types/stateTypes";
import type { ContextMenuSection } from "../../context_menu";
import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
import type { SelectListContextMenuItemParams } from "../../select_list";
import {
	useSavedSearchesState,
	useUpdateSavedSearchesState,
} from "../states/savedSearchesState";
import { useSetTargetSearchState } from "../states/searchSongsState";
import type { SearchFormValues } from "../types/searchTypes";
import { convertSearchToFormValues } from "../utils/searchUtils";

/**
 * Hook for saved searches SelectList props.
 *
 * Handles selection, context menu, and data loading.
 *
 * @returns SelectList props or undefined
 */
export function useSavedSearchesSelectListProps({
	form,
}: {
	form: UseFormReturnType<SearchFormValues>;
}) {
	const notify = useNotification();

	const mpdClient = useMpdClientState();
	const profile = useCurrentMpdProfileState();
	const savedSearches = useSavedSearchesState();
	const updateSavedSearches = useUpdateSavedSearchesState();
	const setTargetSearch = useSetTargetSearchState();

	const contextMenuSections: ContextMenuSection<SelectListContextMenuItemParams>[] =
		[
			{
				items: [
					{
						name: "Delete",
						onClick: async (params?: SelectListContextMenuItemParams) => {
							if (
								params === undefined ||
								profile === undefined ||
								mpdClient === undefined ||
								savedSearches === undefined
							) {
								return;
							}

							const index = savedSearches.searches.findIndex(
								(search) => search.name === params.clickedValue,
							);
							if (index < 0) {
								return;
							}

							const newSavedSearches = savedSearches.clone();
							newSavedSearches.searches.splice(index, 1);
							updateSavedSearches(
								newSavedSearches,
								UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
							);

							notify({
								status: "success",
								title: "Saved search successfully deleted",
								description: `Saved search "${params.clickedValue}" has been deleted.`,
							});
						},
					},
				],
			},
		];

	const onItemsSelected = useCallback(
		async (selectedValues: string[]) => {
			if (selectedValues.length >= 2) {
				throw new Error("Multiple playlists are selected.");
			}
			if (selectedValues.length === 1) {
				const savedSearch = savedSearches?.searches.find(
					(search) => search.name === selectedValues[0],
				);
				if (savedSearch === undefined) {
					return;
				}
				form.setValues(convertSearchToFormValues(savedSearch));
				setTargetSearch(undefined);
			}
		},
		[savedSearches?.searches, setTargetSearch, form],
	);

	if (savedSearches === undefined) {
		return;
	}

	return {
		id: COMPONENT_ID_SEARCH_SIDE_PANE,
		values: savedSearches.searches.map((search) => search.name),
		selectedValues: [],
		headerTitle: "Saved Searches",
		contextMenuSections,
		isLoading: false,
		allowMultipleSelection: false,
		onItemsSelected,
		onLoadingCompleted: async () => {},
	};
}
