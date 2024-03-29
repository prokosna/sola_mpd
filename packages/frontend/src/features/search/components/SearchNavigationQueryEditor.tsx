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
import { changeEditingSearchName, getDefaultSearch } from "../helpers/search";
import {
  useEditingSearchState,
  useEditingSearchStatusState,
  useSaveEditingSearch,
  useSetEditingSearchState,
} from "../states/edit";
import { useSavedSearchesState } from "../states/persistent";
import { useSetTargetSearchState } from "../states/songs";
import {
  useIsSearchLoadingState,
  useSetIsSearchLoadingState,
} from "../states/ui";
import { EditingSearchStatus } from "../types/search";

import { SearchNavigationQueryEditorQuery } from "./SearchNavigationQueryEditorQuery";

export function SearchNavigationQueryEditor() {
  const editingSearch = useEditingSearchState();
  const setEditingSearch = useSetEditingSearchState();
  const saveEditingSearch = useSaveEditingSearch();
  const editingSearchStatus = useEditingSearchStatusState();
  const savedSearches = useSavedSearchesState();
  const isSearchLoading = useIsSearchLoadingState();
  const setIsSearchLoading = useSetIsSearchLoadingState();
  const setTargetSearch = useSetTargetSearchState();

  const existingSearchNames = savedSearches?.map((search) => search.name);

  const [nameErrorState, setNameErrorState] = useState("");

  const isNewSearch =
    existingSearchNames === undefined
      ? true
      : !existingSearchNames.includes(editingSearch.name);

  const onChangeName = useCallback(
    (name: string) => {
      const newSearch = changeEditingSearchName(editingSearch, name);
      if (name === "") {
        setNameErrorState("Name is required.");
      } else {
        setNameErrorState("");
      }
      setEditingSearch(newSearch);
    },
    [editingSearch, setEditingSearch],
  );

  const onClickReset = useCallback(() => {
    setEditingSearch(getDefaultSearch());
  }, [setEditingSearch]);

  const onClickSave = useCallback(() => {
    saveEditingSearch();
  }, [saveEditingSearch]);

  const onClickSearch = useCallback(() => {
    setIsSearchLoading(true);
    setTargetSearch(editingSearch);
  }, [editingSearch, setTargetSearch, setIsSearchLoading]);

  if (savedSearches === undefined) {
    return (
      <Box w="100%" h="100%" className="layout-border-top layout-border-left">
        <FullWidthSkeleton />
      </Box>
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
          <FormControl w="75%" isInvalid={nameErrorState !== ""}>
            <Input
              size="sm"
              type="text"
              variant="flushed"
              value={editingSearch.name}
              onChange={(e) => onChangeName(e.target.value)}
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
              <TagLabel>Columns updated</TagLabel>
            </Tag>
          ) : (
            <Tag h="50%" size={"md"} variant="outline" colorScheme="gray">
              <TagLabel>Not saved</TagLabel>
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
            onClick={onClickReset}
          >
            Reset
          </Button>
          <Button
            variant="outline"
            mx="2"
            size="sm"
            marginRight="auto"
            onClick={onClickSave}
          >
            {isNewSearch ? "Save" : "Update"}
          </Button>
          <Button size="sm" onClick={onClickSearch} isLoading={isSearchLoading}>
            Search
          </Button>
        </Flex>
      </Box>
    </>
  );
}
