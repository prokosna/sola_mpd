import {
  Button,
  Grid,
  GridItem,
  IconButton,
  Input,
  Select,
} from "@chakra-ui/react";
import { Query } from "@sola_mpd/domain/src/models/search_pb.js";
import { SongUtils } from "@sola_mpd/domain/src/utils/SongUtils.js";
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
  listSearchSongMetadataTags,
  removeEditingQueryCondition,
} from "../helpers/search";

export type SearchNavigationQueryEditorQueryConditionProps = {
  query: Query;
  isFirstQuery: boolean;
  index: number;
  onUpdateQuery: (query: Query) => void;
};

export function SearchNavigationQueryEditorQueryCondition(
  props: SearchNavigationQueryEditorQueryConditionProps,
) {
  const { query, isFirstQuery, index, onUpdateQuery } = props;

  const condition = query.conditions[index];
  const isLastCondition = index === query.conditions.length - 1;

  const onAddCondition = useCallback(() => {
    const newQuery = addEditingQueryCondition(query);
    onUpdateQuery(newQuery);
  }, [onUpdateQuery, query]);

  const onChangeTag = useCallback(
    (value: string) => {
      const tag = convertSongMetadataTagFromDisplayName(value);
      const newCondition = condition.clone();
      newCondition.tag = tag;
      const newQuery = changeEditingQueryCondition(query, index, newCondition);
      onUpdateQuery(newQuery);
    },
    [condition, index, onUpdateQuery, query],
  );

  const onChangeOperator = useCallback(
    (value: string) => {
      const operator = convertDisplayNameToOperator(value);
      const newCondition = condition.clone();
      newCondition.operator = operator;
      const newQuery = changeEditingQueryCondition(query, index, newCondition);
      onUpdateQuery(newQuery);
    },
    [condition, index, onUpdateQuery, query],
  );

  const onChangeValue = useCallback(
    (value: string) => {
      const metadataValue = SongUtils.convertStringToSongMetadataValue(value);
      const newCondition = condition.clone();
      newCondition.value = metadataValue;
      const newQuery = changeEditingQueryCondition(query, index, newCondition);
      onUpdateQuery(newQuery);
    },
    [condition, index, onUpdateQuery, query],
  );

  const onRemoveCondition = useCallback(() => {
    const newQuery = removeEditingQueryCondition(query, index);
    onUpdateQuery(newQuery);
  }, [index, onUpdateQuery, query]);

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
              onClick={onAddCondition}
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
            onChange={(e) => onChangeTag(e.target.value)}
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
            onChange={(e) => onChangeOperator(e.target.value)}
          >
            {listAllFilterConditionOperators()
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
            type="text"
            value={SongUtils.convertSongMetadataValueToString(condition.value!)}
            onChange={(e) => onChangeValue(e.target.value)}
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
              onClick={onRemoveCondition}
            ></IconButton>
          )}
        </GridItem>
      </Grid>
    </>
  );
}
