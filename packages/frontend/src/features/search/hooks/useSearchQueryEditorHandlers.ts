import { clone } from "@bufbuild/protobuf";
import type { UseFormReturnType } from "@mantine/form";
import { SavedSearchesSchema } from "@sola_mpd/shared/src/models/search_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { UpdateMode } from "../../../types/stateTypes";
import {
	convertConditionToFormValues,
	convertFormValuesToSearch,
	getDefaultCondition,
} from "../functions/search";
import { setEditingSearchStatusActionAtom } from "../states/actions/setEditingSearchStatusActionAtom";
import { setIsSearchLoadingActionAtom } from "../states/actions/setIsSearchLoadingActionAtom";
import { setTargetSearchActionAtom } from "../states/actions/setTargetSearchActionAtom";
import { updateSavedSearchesActionAtom } from "../states/actions/updateSavedSearchesActionAtom";
import { savedSearchesAtom } from "../states/atoms/savedSearchesAtom";
import { searchSongTableColumnsAtom } from "../states/atoms/searchEditAtom";
import {
	EditingSearchStatus,
	type SearchFormValues,
} from "../types/searchTypes";

export function useSearchQueryEditorHandlers(
	form: UseFormReturnType<SearchFormValues>,
) {
	const savedSearches = useAtomValue(savedSearchesAtom);
	const updateSavedSearchesAction = useSetAtom(updateSavedSearchesActionAtom);
	const setIsSearchLoading = useSetAtom(setIsSearchLoadingActionAtom);
	const setTargetSearch = useSetAtom(setTargetSearchActionAtom);
	const searchSongTableColumns = useAtomValue(searchSongTableColumnsAtom);
	const setEditingSearchStatus = useSetAtom(setEditingSearchStatusActionAtom);

	const handleSave = useCallback(
		(values: typeof form.values) => {
			if (savedSearches === undefined) {
				return;
			}
			const editingSearch = convertFormValuesToSearch(values);
			editingSearch.columns = searchSongTableColumns;
			const index = savedSearches.searches.findIndex(
				(search) => search.name === editingSearch.name,
			);
			if (index >= 0) {
				savedSearches.searches[index] = editingSearch;
			} else {
				savedSearches.searches.push(editingSearch);
			}

			updateSavedSearchesAction({
				savedSearches: clone(SavedSearchesSchema, savedSearches),
				mode: UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
			});
			setEditingSearchStatus(EditingSearchStatus.SAVED);
		},
		[
			savedSearches,
			searchSongTableColumns,
			setEditingSearchStatus,
			updateSavedSearchesAction,
		],
	);

	const handleReset = useCallback(() => {
		form.reset();
	}, [form]);

	const handleSearch = useCallback(() => {
		if (savedSearches === undefined) {
			return;
		}
		const editingSearch = convertFormValuesToSearch(form.getValues());
		setIsSearchLoading(true);
		setTargetSearch(editingSearch);
	}, [savedSearches, setIsSearchLoading, setTargetSearch, form]);

	const handleAddCondition = useCallback(
		(queryIndex: number) => {
			form.insertListItem(
				`queries.${queryIndex}.conditions`,
				convertConditionToFormValues(getDefaultCondition()),
			);
		},
		[form],
	);

	const handleDeleteCondition = useCallback(
		(queryIndex: number, conditionIndex: number) => {
			form.removeListItem(`queries.${queryIndex}.conditions`, conditionIndex);
			if (form.getValues().queries[queryIndex].conditions.length === 0) {
				form.removeListItem("queries", queryIndex);
			}
		},
		[form],
	);

	const handleAddQuery = useCallback(() => {
		form.insertListItem("queries", {
			conditions: [convertConditionToFormValues(getDefaultCondition())],
		});
	}, [form]);

	const existingSearchNames = savedSearches?.searches.map(
		(search) => search.name,
	);
	const isNewSearch =
		existingSearchNames === undefined
			? true
			: !existingSearchNames.includes(form.getValues().name);

	return {
		handleSave,
		handleReset,
		handleSearch,
		handleAddCondition,
		handleDeleteCondition,
		handleAddQuery,
		isNewSearch,
		savedSearches,
	};
}
