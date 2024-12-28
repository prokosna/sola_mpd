import {
  Button,
  Grid,
  GridItem,
  IconButton,
  Input,
  Select,
} from "@chakra-ui/react";
import { FilterCondition_Operator } from "@sola_mpd/domain/src/models/filter_pb.js";
import { Query } from "@sola_mpd/domain/src/models/search_pb.js";
import { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";
import {
  convertSongMetadataValueToString,
  convertStringToSongMetadataValue,
} from "@sola_mpd/domain/src/utils/songUtils.js";
import { useCallback } from "react";
import { IoTrashOutline } from "react-icons/io5";

import {
  convertDisplayNameToOperator,
  convertOperatorToDisplayName,
  listAllFilterConditionOperators,
} from "../../song_filter";
import {
  convertSongMetadataTagFromDisplayName,
  convertSongMetadataTagToDisplayName,
} from "../../song_table";
import {
  addEditingQueryCondition,
  changeEditingQueryCondition,
  isValidOperatorWithMetadataTag,
  listSearchSongMetadataTags,
  removeEditingQueryCondition,
} from "../utils/searchUtils";

export type SearchNavigationQueryEditorQueryConditionProps = {
  query: Query;
  isFirstQuery: boolean;
  index: number;
  onQueryUpdated: (query: Query) => void;
};

/**
 * SearchNavigationQueryEditorQueryCondition component renders a single condition editor within a query.
 * It allows users to edit, add, and remove filter conditions for a search query.
 *
 * @param props - The component props
 * @param props.query - The current Query object being edited
 * @param props.isFirstQuery - Boolean indicating if this is the first query in the search
 * @param props.index - The index of the current condition within the query
 * @param props.onQueryUpdated - Callback function to handle updates to the query
 * @returns JSX element representing a single condition editor
 */
export function SearchNavigationQueryEditorQueryCondition(
  props: SearchNavigationQueryEditorQueryConditionProps,
) {
  const { query, isFirstQuery, index, onQueryUpdated } = props;

  const condition = query.conditions[index];
  const isLastCondition = index === query.conditions.length - 1;

  const handleConditionAdded = useCallback(() => {
    const newQuery = addEditingQueryCondition(query);
    onQueryUpdated(newQuery);
  }, [onQueryUpdated, query]);

  const handleTagChange = useCallback(
    (value: string) => {
      const tag = convertSongMetadataTagFromDisplayName(value);
      const newCondition = condition.clone();
      newCondition.tag = tag;
      if (
        !isValidOperatorWithMetadataTag(newCondition.tag, newCondition.operator)
      ) {
        newCondition.operator =
          listAllFilterConditionOperators()
            .filter((operator) =>
              isValidOperatorWithMetadataTag(newCondition.tag, operator),
            )
            .at(0) || FilterCondition_Operator.UNKNOWN;
      }
      const newQuery = changeEditingQueryCondition(query, index, newCondition);
      onQueryUpdated(newQuery);
    },
    [condition, index, onQueryUpdated, query],
  );

  const handleOperatorChange = useCallback(
    (value: string) => {
      const operator = convertDisplayNameToOperator(value);
      const newCondition = condition.clone();
      newCondition.operator = operator;
      const newQuery = changeEditingQueryCondition(query, index, newCondition);
      onQueryUpdated(newQuery);
    },
    [condition, index, onQueryUpdated, query],
  );

  const handleValueChange = useCallback(
    (value: string) => {
      const metadataValue = convertStringToSongMetadataValue(value);
      const newCondition = condition.clone();
      newCondition.value = metadataValue;
      const newQuery = changeEditingQueryCondition(query, index, newCondition);
      onQueryUpdated(newQuery);
    },
    [condition, index, onQueryUpdated, query],
  );

  const handleConditionRemoved = useCallback(() => {
    const newQuery = removeEditingQueryCondition(query, index);
    onQueryUpdated(newQuery);
  }, [index, onQueryUpdated, query]);

  return (
    <>
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
          {isLastCondition ? (
            <Button
              p={1}
              size={"sm"}
              variant="outline"
              colorScheme="brand"
              onClick={handleConditionAdded}
            >
              AND
            </Button>
          ) : index !== 0 ? (
            <Button
              p={1}
              size={"sm"}
              variant="ghost"
              colorScheme="gray"
              disabled
            >
              AND
            </Button>
          ) : (
            <Button p={1} size={"sm"} disabled opacity={0}>
              AND
            </Button>
          )}
        </GridItem>
        <GridItem area={"tag"}>
          <Select
            value={convertSongMetadataTagToDisplayName(condition.tag)}
            size="sm"
            onChange={(e) => handleTagChange(e.target.value)}
          >
            {listSearchSongMetadataTags()
              .map((tag) => convertSongMetadataTagToDisplayName(tag))
              .map((tag, i) => (
                <option key={i} value={tag}>
                  {tag}
                </option>
              ))}
          </Select>
        </GridItem>
        <GridItem area={"operator"}>
          <Select
            value={convertOperatorToDisplayName(condition.operator)}
            size="sm"
            onChange={(e) => handleOperatorChange(e.target.value)}
          >
            {listAllFilterConditionOperators()
              .filter((operator) =>
                isValidOperatorWithMetadataTag(condition.tag, operator),
              )
              .map((operator) => convertOperatorToDisplayName(operator))
              .map((operator, i) => (
                <option key={i} value={operator}>
                  {operator}
                </option>
              ))}
          </Select>
        </GridItem>
        <GridItem area={"value"}>
          <Input
            size="sm"
            type={
              condition.tag === Song_MetadataTag.UPDATED_AT ? "date" : "text"
            }
            value={convertSongMetadataValueToString(condition.value!)}
            onChange={(e) => handleValueChange(e.target.value)}
          ></Input>
        </GridItem>
        <GridItem area={"trash"}>
          {isFirstQuery && index === 0 ? (
            <IconButton
              size="sm"
              icon={<IoTrashOutline />}
              aria-label={"trash"}
              colorScheme="gray"
              disabled
              opacity={0}
            ></IconButton>
          ) : (
            <IconButton
              size="sm"
              icon={<IoTrashOutline />}
              aria-label={"trash"}
              colorScheme="gray"
              onClick={handleConditionRemoved}
            ></IconButton>
          )}
        </GridItem>
      </Grid>
    </>
  );
}
