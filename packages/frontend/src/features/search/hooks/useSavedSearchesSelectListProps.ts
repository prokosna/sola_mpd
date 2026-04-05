import { clone } from "@bufbuild/protobuf";
import type { UseFormReturnType } from "@mantine/form";
import { SavedSearchesSchema } from "@sola_mpd/shared/src/models/search_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { COMPONENT_ID_SEARCH_SIDE_PANE } from "../../../const/component";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import { UpdateMode } from "../../../types/stateTypes";
import type { ContextMenuSection } from "../../context_menu";
import { mpdClientAtom } from "../../mpd";
import { currentMpdProfileAtom } from "../../profile";
import type { SelectListContextMenuItemParams } from "../../select_list";
import { convertSearchToFormValues } from "../functions/search";
import { setTargetSearchActionAtom } from "../states/actions/setTargetSearchActionAtom";
import { updateSavedSearchesActionAtom } from "../states/actions/updateSavedSearchesActionAtom";
import { savedSearchesAtom } from "../states/atoms/savedSearchesAtom";
import type { SearchFormValues } from "../types/searchTypes";

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

	const mpdClient = useAtomValue(mpdClientAtom);
	const profile = useAtomValue(currentMpdProfileAtom);
	const savedSearches = useAtomValue(savedSearchesAtom);
	const updateSavedSearchesAction = useSetAtom(updateSavedSearchesActionAtom);
	const setTargetSearch = useSetAtom(setTargetSearchActionAtom);

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

							const newSavedSearches = clone(
								SavedSearchesSchema,
								savedSearches,
							);
							newSavedSearches.searches.splice(index, 1);
							updateSavedSearchesAction({
								savedSearches: newSavedSearches,
								mode: UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
							});

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
