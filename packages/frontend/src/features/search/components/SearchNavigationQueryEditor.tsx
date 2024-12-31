import {
  Flex,
  FormControl,
  Input,
  FormErrorMessage,
  Tag,
  Text,
  TagLabel,
  Spacer,
  Divider,
  Button,
  Box,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";

import { FullWidthSkeleton } from "../../loading";
import { useSavedSearchesState } from "../states/savedSearchesState";
import {
  useEditingSearchState,
  useEditingSearchStatusState,
  useSaveEditingSearch,
  useSetEditingSearchState,
} from "../states/searchEditState";
import { useSetTargetSearchState } from "../states/searchSongsState";
import {
  useIsSearchLoadingState,
  useSetIsSearchLoadingState,
} from "../states/searchUiState";
import { EditingSearchStatus } from "../types/searchTypes";
import {
  changeEditingSearchName,
  getDefaultSearch,
} from "../utils/searchUtils";

import { SearchNavigationQueryEditorQuery } from "./SearchNavigationQueryEditorQuery";

/**
 * SearchNavigationQueryEditor component renders the query editor for search navigation.
 * It allows users to create, edit, and execute search queries.
 * @returns JSX element representing the SearchNavigationQueryEditor component
 */
export function SearchNavigationQueryEditor() {
  const editingSearch = useEditingSearchState();
  const editingSearchStatus = useEditingSearchStatusState();
  const savedSearches = useSavedSearchesState();
  const isSearchLoading = useIsSearchLoadingState();
  const setEditingSearch = useSetEditingSearchState();
  const saveEditingSearch = useSaveEditingSearch();
  const setIsSearchLoading = useSetIsSearchLoadingState();
  const setTargetSearch = useSetTargetSearchState();

  const existingSearchNames = savedSearches?.searches.map(
    (search) => search.name,
  );

  const [nameErrorState, setNameErrorState] = useState("");

  const isNewSearch =
    existingSearchNames === undefined
      ? true
      : !existingSearchNames.includes(editingSearch.name);

  const handleNameChanged = useCallback(
    (name: string) => {
      const newSearch = changeEditingSearchName(editingSearch, name);
      if (name === "") {
        setNameErrorState("Name is required.");
      } else {
        setNameErrorState("");
      }
      setEditingSearch(newSearch, EditingSearchStatus.NOT_SAVED);
    },
    [editingSearch, setEditingSearch],
  );

  const handleResetClick = useCallback(() => {
    setEditingSearch(getDefaultSearch(), EditingSearchStatus.NOT_SAVED);
  }, [setEditingSearch]);

  const handleSaveClick = useCallback(() => {
    saveEditingSearch();
  }, [saveEditingSearch]);

  const handleSearchClick = useCallback(() => {
    setIsSearchLoading(true);
    setTargetSearch(editingSearch);
  }, [editingSearch, setTargetSearch, setIsSearchLoading]);

  if (savedSearches === undefined) {
    return (
      <FullWidthSkeleton className="layout-border-top layout-border-left" />
    );
  }

  return (
    <>
      <Flex
        className="layout-border-top layout-border-left layout-general-header-bg"
        w="100%"
        h="49px"
        alignItems={"center"}
      >
        <Text as={"b"} px={18}>
          Search Editor
        </Text>
      </Flex>
      <Box
        className="layout-border-top layout-border-left"
        px={4}
        pt={2}
        pb={2}
        w="100%"
        h="calc(100% - 49px)"
        overflow={"auto"}
      >
        <Flex>
          <FormControl w="60%" isInvalid={nameErrorState !== ""}>
            <Input
              size="sm"
              type="text"
              variant="flushed"
              value={editingSearch.name}
              onChange={(e) => handleNameChanged(e.target.value)}
            ></Input>
            {nameErrorState !== "" ? (
              <FormErrorMessage>{nameErrorState}</FormErrorMessage>
            ) : null}
          </FormControl>
          {editingSearchStatus === EditingSearchStatus.SAVED ? (
            <Tag h="50%" size={"md"} variant="outline" colorScheme="green">
              <TagLabel>Saved</TagLabel>
            </Tag>
          ) : editingSearchStatus === EditingSearchStatus.COLUMNS_UPDATED ? (
            <Tag h="50%" size={"md"} variant="outline" colorScheme="gray">
              <TagLabel>Not Saved</TagLabel>
            </Tag>
          ) : (
            <Tag h="50%" size={"md"} variant="outline" colorScheme="gray">
              <TagLabel>Not Saved</TagLabel>
            </Tag>
          )}
        </Flex>
        <Spacer m={2}></Spacer>
        {editingSearch.queries.map((_query, index) => (
          <SearchNavigationQueryEditorQuery
            key={`query_${index}`}
            {...{ editingSearch, index }}
          />
        ))}
        <Divider my={2}></Divider>
        <Flex justifyContent={"start"}>
          <Button
            colorScheme="red"
            variant="outline"
            size="sm"
            onClick={handleResetClick}
          >
            Reset
          </Button>
          <Button
            variant="outline"
            mx="2"
            size="sm"
            marginRight="auto"
            onClick={handleSaveClick}
          >
            {isNewSearch ? "Save" : "Update"}
          </Button>
          <Button
            size="sm"
            onClick={handleSearchClick}
            isLoading={isSearchLoading}
          >
            Search
          </Button>
        </Flex>
      </Box>
    </>
  );
}
