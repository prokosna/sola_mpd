import { Button, Center } from "@chakra-ui/react";
import type { Query, Search } from "@sola_mpd/domain/src/models/search_pb.js";
import { useCallback } from "react";

import { useSetEditingSearchState } from "../states/searchEditState";
import { EditingSearchStatus } from "../types/searchTypes";
import {
	addEditingSearchQuery,
	changeEditingSearchQuery,
	removeEditingSearchQuery,
} from "../utils/searchUtils";

import { SearchNavigationQueryEditorQueryCondition } from "./SearchNavigationQueryEditorQueryCondition";

export type SearchNavigationQueryEditorQueryProps = {
	editingSearch: Search;
	index: number;
};

/**
 * Single query editor in search navigation.
 *
 * @param props Component props
 * @param props.editingSearch Current search being edited
 * @param props.index Query index in search
 * @returns Query editor component
 */
export function SearchNavigationQueryEditorQuery(
	props: SearchNavigationQueryEditorQueryProps,
) {
	const { editingSearch, index } = props;

	const setEditingSearch = useSetEditingSearchState();

	const query = editingSearch.queries[index];
	const isLastQuery = index === editingSearch.queries.length - 1;

	const handleAddQueryClick = useCallback(() => {
		const newSearch = addEditingSearchQuery(editingSearch);
		setEditingSearch(newSearch, EditingSearchStatus.NOT_SAVED);
	}, [editingSearch, setEditingSearch]);

	const handleQueryUpdated = useCallback(
		(newQuery: Query) => {
			let newSearch: Search;
			if (newQuery.conditions.length === 0) {
				newSearch = removeEditingSearchQuery(editingSearch, index);
			} else {
				newSearch = changeEditingSearchQuery(editingSearch, index, newQuery);
			}
			setEditingSearch(newSearch, EditingSearchStatus.NOT_SAVED);
		},
		[editingSearch, index, setEditingSearch],
	);

	return (
		<>
			{query.conditions.map((condition, i) => (
				<SearchNavigationQueryEditorQueryCondition
					key={condition.uuid}
					{...{
						query,
						isFirstQuery: index === 0,
						index: i,
						onQueryUpdated: handleQueryUpdated,
					}}
				/>
			))}
			{!isLastQuery ? (
				<Center key={`or_button_${index}`}>
					<Button p={1} size={"sm"} variant="ghost" colorScheme="gray" disabled>
						OR
					</Button>
				</Center>
			) : (
				<Center key={"last_or_button"}>
					<Button
						size={"sm"}
						variant="outline"
						colorScheme="brand"
						onClick={handleAddQueryClick}
					>
						OR
					</Button>
				</Center>
			)}
		</>
	);
}
