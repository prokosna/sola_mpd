import { Button, Center } from "@chakra-ui/react";
import { Query, Search } from "@sola_mpd/domain/src/models/search_pb.js";
import { useCallback } from "react";

import {
  addEditingSearchQuery,
  changeEditingSearchQuery,
  removeEditingSearchQuery,
} from "../helpers/search";
import { useSetEditingSearchState } from "../states/edit";

import SearchNavigationQueryEditorQueryCondition from "./SearchNavigationQueryEditorQueryCondition";

export type SearchNavigationQueryEditorQueryProps = {
  editingSearch: Search;
  index: number;
};

export default function SearchNavigationQueryEditorQuery(
  props: SearchNavigationQueryEditorQueryProps,
) {
  const { editingSearch, index } = props;

  const setEditingSearch = useSetEditingSearchState();

  const query = editingSearch.queries[index];
  const isLastQuery = index === editingSearch.queries.length - 1;

  const onClickToAddQuery = useCallback(() => {
    const newSearch = addEditingSearchQuery(editingSearch);
    setEditingSearch(newSearch);
  }, [editingSearch, setEditingSearch]);

  const onUpdateQuery = useCallback(
    (newQuery: Query) => {
      let newSearch;
      if (newQuery.conditions.length === 0) {
        newSearch = removeEditingSearchQuery(editingSearch, index);
      } else {
        newSearch = changeEditingSearchQuery(editingSearch, index, newQuery);
      }
      setEditingSearch(newSearch);
    },
    [editingSearch, index, setEditingSearch],
  );

  return (
    <>
      {query.conditions.map((_condition, i) => (
        <SearchNavigationQueryEditorQueryCondition
          key={`condition_${i}`}
          {...{ query, isFirstQuery: index === 0, index: i, onUpdateQuery }}
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
            onClick={onClickToAddQuery}
          >
            OR
          </Button>
        </Center>
      )}
    </>
  );
}
