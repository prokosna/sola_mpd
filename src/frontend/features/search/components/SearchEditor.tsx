import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  Grid,
  GridItem,
  Icon,
  IconButton,
  Input,
  Select,
  Spacer,
  Tag,
  TagLabel,
  Text,
} from "@chakra-ui/react";
import { produce } from "immer";
import React from "react";
import { IoAddOutline, IoTrashOutline } from "react-icons/io5";

import { useSearchEditor } from "../hooks/useSearchEditor";

import { Query } from "@/models/search";
import { FilterUtils } from "@/utils/FilterUtils";
import { SongTableUtils } from "@/utils/SongTableUtils";
import { SongUtils } from "@/utils/SongUtils";

export default function SearchEditor() {
  const {
    currentSearch,
    isEditingSearchSaved,
    songMetadataTagOptionsForDisplay,
    operatorOptions,
    errorMessage,
    isUpdate,
    updateCurrentSearch,
    onConditionAdded,
    onConditionRemoved,
    onConditionGroupAdded,
    onSearchClicked,
    onResetClicked,
    onSaveClicked,
  } = useSearchEditor();

  function displayQuery(queryIndex: number, query: Query): React.ReactNode[] {
    return query.conditions.map((condition, index) => {
      return (
        <Grid
          key={condition.uuid}
          templateAreas={`"add tag operator value trash"`}
          w="100%"
          gridTemplateColumns={"1fr 3fr 2fr 4fr 1fr"}
          gap="1"
          alignItems={"center"}
          py={2}
        >
          <GridItem area={"add"}>
            {index === query.conditions.length - 1 ? (
              <Button
                p={1}
                size={"sm"}
                variant="outline"
                colorScheme="brand"
                onClick={() => {
                  onConditionAdded(queryIndex);
                }}
              >
                AND
                <Icon boxSize="12px" as={IoAddOutline} />
              </Button>
            ) : index !== 0 ? (
              <Button size={"sm"} variant="ghost" colorScheme="gray" disabled>
                AND
              </Button>
            ) : null}
          </GridItem>
          <GridItem area={"tag"}>
            <Select
              value={SongTableUtils.convertSongMetadataTagToDisplayName(
                condition.tag,
              )}
              size="sm"
              onChange={(e) => {
                updateCurrentSearch(
                  produce(currentSearch, (draft) => {
                    draft.queries[queryIndex].conditions[index].tag =
                      SongTableUtils.convertSongMetadataTagFromDisplayName(
                        e.target.value,
                      );
                  }),
                );
              }}
            >
              {songMetadataTagOptionsForDisplay
                .map((v) =>
                  SongTableUtils.convertSongMetadataTagToDisplayName(v),
                )
                .map((v, i) => (
                  <option key={i} value={v}>
                    {v}
                  </option>
                ))}
            </Select>
          </GridItem>
          <GridItem area={"operator"}>
            <Select
              value={FilterUtils.convertOperatorToDisplayName(
                condition.operator,
              )}
              size="sm"
              onChange={(e) => {
                updateCurrentSearch(
                  produce(currentSearch, (draft) => {
                    draft.queries[queryIndex].conditions[index].operator =
                      FilterUtils.convertDisplayNameToOperator(e.target.value);
                  }),
                );
              }}
            >
              {operatorOptions
                .map((v) => FilterUtils.convertOperatorToDisplayName(v))
                .map((v, i) => (
                  <option key={i} value={v}>
                    {v}
                  </option>
                ))}
            </Select>
          </GridItem>
          <GridItem area={"value"}>
            <Input
              size="sm"
              type="text"
              value={SongUtils.convertSongMetadataValueToString(
                condition.value,
              )}
              onChange={(e) => {
                updateCurrentSearch(
                  produce(currentSearch, (draft) => {
                    draft.queries[queryIndex].conditions[index].value =
                      SongUtils.convertStringToSongMetadataValue(
                        e.target.value,
                      );
                  }),
                );
              }}
            ></Input>
          </GridItem>
          <GridItem area={"trash"}>
            {queryIndex === 0 && index === 0 ? null : (
              <IconButton
                size="sm"
                icon={<IoTrashOutline></IoTrashOutline>}
                aria-label={"trash"}
                colorScheme="gray"
                onClick={() => {
                  onConditionRemoved(condition.uuid);
                }}
              ></IconButton>
            )}
          </GridItem>
        </Grid>
      );
    });
  }

  function displayConditions(): React.ReactNode[] {
    if (currentSearch.queries === undefined) {
      return [];
    }

    return [
      ...currentSearch.queries
        .map((query, queryIndex) => displayQuery(queryIndex, query))
        .reduce(
          (prev, curr, i) => [
            ...prev,
            ...curr,
            <Center key={i}>
              <Button
                p={1}
                size={"sm"}
                variant="ghost"
                colorScheme="gray"
                disabled
              >
                OR
              </Button>
            </Center>,
          ],
          [],
        )
        .slice(0, -1)
        .flat(),
      <Center key={"last_or_button"}>
        <Button
          size={"sm"}
          variant="outline"
          colorScheme="brand"
          onClick={onConditionGroupAdded}
        >
          OR
          <Icon boxSize="12px" as={IoAddOutline} />
        </Button>
      </Center>,
    ];
  }

  return (
    <>
      <Flex
        w="100%"
        h="49px"
        alignItems={"center"}
        borderLeft={"1px solid"}
        borderTop={"1px solid"}
        borderColor={"gray.300"}
        backgroundColor={"#f8f8f8"}
      >
        <Text as={"b"} px={18}>
          Editor
        </Text>
      </Flex>
      <Box
        px={4}
        pt={2}
        pb={2}
        w="100%"
        h="calc(100% - 49px)"
        borderLeft={"1px solid"}
        borderTop={"1px solid"}
        borderColor={"gray.300"}
        overflow={"auto"}
      >
        <Flex>
          <FormControl w="75%" isInvalid={errorMessage !== ""}>
            <Input
              size="sm"
              type="text"
              variant="flushed"
              value={currentSearch.name}
              onChange={(e) => {
                updateCurrentSearch(
                  produce(currentSearch, (draft) => {
                    draft.name = e.target.value;
                  }),
                );
              }}
            ></Input>
            {errorMessage !== "" ? (
              <FormErrorMessage>{errorMessage}</FormErrorMessage>
            ) : null}
          </FormControl>
          {isEditingSearchSaved ? (
            <Tag h="50%" size={"md"} variant="outline" colorScheme="green">
              <TagLabel>Saved</TagLabel>
            </Tag>
          ) : (
            <Tag h="50%" size={"md"} variant="outline" colorScheme="gray">
              <TagLabel>Not saved</TagLabel>
            </Tag>
          )}
        </Flex>
        <Spacer m={2}></Spacer>
        {displayConditions()}
        <Divider my={2}></Divider>
        <Flex justifyContent={"start"}>
          <Button
            colorScheme="red"
            variant="outline"
            size="sm"
            marginRight="auto"
            onClick={onResetClicked}
          >
            Reset
          </Button>
          <Button variant="outline" size="sm" mx="2" onClick={onSearchClicked}>
            Search
          </Button>
          <Button size="sm" onClick={onSaveClicked}>
            {isUpdate ? "Update" : "Save"}
          </Button>
        </Flex>
      </Box>
    </>
  );
}
