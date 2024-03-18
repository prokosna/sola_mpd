import {
  Center,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  VStack,
  Button,
  IconButton,
  ModalFooter,
} from "@chakra-ui/react";
import { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { SongUtils } from "@sola_mpd/domain/src/utils/SongUtils.js";
import { useCallback, useEffect, useState } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

import { normalizeSongTableColumns } from "../helpers/columns";

import { ColumnEditModalTagListBox } from "./ColumnEditModalTagListBox";

export type ColumnEditModalProps = {
  columns: SongTableColumn[];
  isOpen: boolean;
  onOk: (newColumns: SongTableColumn[]) => Promise<void>;
  onCancel: () => Promise<void>;
};

export function ColumnEditModal(props: ColumnEditModalProps) {
  // Available tags in use
  const [activeTagsState, setActiveTagsState] = useState<Song_MetadataTag[]>(
    [],
  );
  useEffect(() => {
    if (props.isOpen) {
      setActiveTagsState(props.columns.map((column) => column.tag));
    }
  }, [props.columns, props.isOpen]);
  const [selectedActiveTag, setSelectedActiveTag] = useState<
    Song_MetadataTag | undefined
  >(undefined);

  // Available tags not in use
  const inactiveTags = SongUtils.listAllSongMetadataTags().filter(
    (v) => !activeTagsState.includes(v),
  );
  const [selectedInactiveTag, setSelectedInactiveTag] = useState<
    Song_MetadataTag | undefined
  >(undefined);

  // Handlers
  const onSelectActiveTag = useCallback((tag: Song_MetadataTag) => {
    setSelectedActiveTag(tag);
    setSelectedInactiveTag(undefined);
  }, []);

  const onSelectInactiveTag = useCallback((tag: Song_MetadataTag) => {
    setSelectedInactiveTag(tag);
    setSelectedActiveTag(undefined);
  }, []);

  const onMoveItemToActive = useCallback(() => {
    if (selectedInactiveTag !== undefined) {
      setActiveTagsState([...activeTagsState, selectedInactiveTag]);
      setSelectedInactiveTag(undefined);
    }
  }, [activeTagsState, selectedInactiveTag]);

  const onMoveItemFromActive = useCallback(() => {
    if (selectedActiveTag !== undefined) {
      setActiveTagsState(
        activeTagsState.filter((tag) => tag !== selectedActiveTag),
      );
      setSelectedActiveTag(undefined);
    }
  }, [activeTagsState, selectedActiveTag]);

  const onSubmit = useCallback(() => {
    // Remove
    const newColumns = normalizeSongTableColumns(
      props.columns.filter((column) => activeTagsState.includes(column.tag)),
    );

    // Calculate column width
    const flexWidthSum = newColumns
      .map((v) => v.widthFlex)
      .reduce((a, b) => a + b, 0);
    const flexWidthAvg = flexWidthSum / newColumns.length || 0;

    // Add
    for (const tag of activeTagsState) {
      if (newColumns.every((column) => column.tag !== tag)) {
        newColumns.push(
          new SongTableColumn({
            tag,
            widthFlex: Math.floor(flexWidthAvg),
            isSortDesc: false,
          }),
        );
      }
    }

    // Copy attributes
    props.onOk(
      newColumns.map((newColumn) => {
        for (const existingColumn of props.columns) {
          if (newColumn.tag === existingColumn.tag) {
            newColumn.isSortDesc = existingColumn.isSortDesc;
            newColumn.sortOrder = existingColumn.sortOrder;
            return newColumn;
          }
        }
        return newColumn;
      }),
    );
  }, [activeTagsState, props]);

  return (
    <>
      <Modal
        isCentered
        closeOnOverlayClick={false}
        isOpen={props.isOpen}
        onClose={() => {
          if (props.onCancel !== undefined) {
            props.onCancel();
          }
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit columns</ModalHeader>
          <ModalBody pb={6}>
            <Center>
              <HStack>
                <VStack>
                  <ColumnEditModalTagListBox
                    title="Active Tags"
                    selectedTag={selectedActiveTag}
                    tags={activeTagsState}
                    onClick={onSelectActiveTag}
                  ></ColumnEditModalTagListBox>
                </VStack>
                <VStack>
                  <IconButton
                    aria-label={"move_from_active"}
                    icon={<IoChevronForward />}
                    onClick={onMoveItemFromActive}
                  ></IconButton>
                  <IconButton
                    aria-label={"move_to_active"}
                    icon={<IoChevronBack />}
                    onClick={onMoveItemToActive}
                  ></IconButton>
                </VStack>
                <VStack>
                  <ColumnEditModalTagListBox
                    title="Inactive Tags"
                    selectedTag={selectedInactiveTag}
                    tags={inactiveTags}
                    onClick={onSelectInactiveTag}
                  ></ColumnEditModalTagListBox>
                </VStack>
              </HStack>
            </Center>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="brand" mr={3} onClick={onSubmit}>
              OK
            </Button>
            <Button onClick={props.onCancel} colorScheme="gray">
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
