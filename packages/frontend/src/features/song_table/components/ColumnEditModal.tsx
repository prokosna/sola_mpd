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

import {
  copySortingAttributesToNewColumns,
  ensureTagsContainedInColumns,
  getAverageWidthFlex,
  normalizeSongTableColumns,
} from "../utils/columnUtils";

import { ColumnEditModalTagListBox } from "./ColumnEditModalTagListBox";

export type ColumnEditModalProps = {
  columns: SongTableColumn[];
  isOpen: boolean;
  updateColumns: (newColumns: SongTableColumn[]) => Promise<void>;
  disposeModal: () => Promise<void>;
};

export function ColumnEditModal(props: ColumnEditModalProps): JSX.Element {
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
  const onActiveTagSelected = useCallback((tag: Song_MetadataTag) => {
    setSelectedActiveTag(tag);
    setSelectedInactiveTag(undefined);
  }, []);
  const onInactiveTagSelected = useCallback((tag: Song_MetadataTag) => {
    setSelectedInactiveTag(tag);
    setSelectedActiveTag(undefined);
  }, []);
  const onItemMovedToActive = useCallback(() => {
    if (selectedInactiveTag !== undefined) {
      setActiveTagsState([...activeTagsState, selectedInactiveTag]);
      setSelectedInactiveTag(undefined);
    }
  }, [activeTagsState, selectedInactiveTag]);
  const onItemMovedToInactive = useCallback(() => {
    if (selectedActiveTag !== undefined) {
      setActiveTagsState(
        activeTagsState.filter((tag) => tag !== selectedActiveTag),
      );
      setSelectedActiveTag(undefined);
    }
  }, [activeTagsState, selectedActiveTag]);

  const onSubmit = useCallback(() => {
    // Remove inactive tags from the columns.
    const normalizedColumns = normalizeSongTableColumns(
      props.columns.filter((column) => activeTagsState.includes(column.tag)),
    );

    // Add missing columns.
    const averageWidthFlex = getAverageWidthFlex(normalizedColumns);
    const activeColumns = ensureTagsContainedInColumns(
      normalizedColumns,
      activeTagsState,
      averageWidthFlex,
    );

    const newColumns = copySortingAttributesToNewColumns(
      activeColumns,
      props.columns,
    );

    props.updateColumns(newColumns);
  }, [activeTagsState, props]);

  return (
    <>
      <Modal
        isCentered
        closeOnOverlayClick={false}
        isOpen={props.isOpen}
        onClose={() => {
          if (props.disposeModal !== undefined) {
            props.disposeModal();
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
                    selectTag={onActiveTagSelected}
                  ></ColumnEditModalTagListBox>
                </VStack>
                <VStack>
                  <IconButton
                    aria-label={"Move a selected item to inactive"}
                    icon={<IoChevronForward />}
                    onClick={onItemMovedToInactive}
                  ></IconButton>
                  <IconButton
                    aria-label={"Move a selected item to active"}
                    icon={<IoChevronBack />}
                    onClick={onItemMovedToActive}
                  ></IconButton>
                </VStack>
                <VStack>
                  <ColumnEditModalTagListBox
                    title="Inactive Tags"
                    selectedTag={selectedInactiveTag}
                    tags={inactiveTags}
                    selectTag={onInactiveTagSelected}
                  ></ColumnEditModalTagListBox>
                </VStack>
              </HStack>
            </Center>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="brand" mr={3} onClick={onSubmit}>
              OK
            </Button>
            <Button onClick={props.disposeModal} colorScheme="gray">
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
