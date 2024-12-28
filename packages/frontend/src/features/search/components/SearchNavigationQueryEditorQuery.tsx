import { Button, Center } from "@chakra-ui/react";
import { Query, Search } from "@sola_mpd/domain/src/models/search_pb.js";
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
 * SearchNavigationQueryEditorQuery component renders a single query editor within the search navigation.
 * It allows users to edit, add, and remove query conditions.
 *
 * @param props - The component props
 * @param props.editingSearch - The current Search object being edited
 * @param props.index - The index of the current Query within the Search object
 * @returns JSX element representing a single query editor
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
      let newSearch;
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
      {query.conditions.map((_condition, i) => (
        <SearchNavigationQueryEditorQueryCondition
          key={`condition_${i}`}
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
