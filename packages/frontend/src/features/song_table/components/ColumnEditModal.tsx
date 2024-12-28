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
import { listAllSongMetadataTags } from "@sola_mpd/domain/src/utils/songUtils.js";
import { useCallback, useEffect, useState } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

import {
  copySortingAttributesToNewColumns,
  ensureTagsContainedInColumns,
  getAverageWidthFlex,
  normalizeSongTableColumns,
} from "../utils/songTableColumnUtils";

import { ColumnEditModalTagListBox } from "./ColumnEditModalTagListBox";

export type ColumnEditModalProps = {
  columns: SongTableColumn[];
  isOpen: boolean;
  handleColumnsUpdated: (newColumns: SongTableColumn[]) => Promise<void>;
  handleModalDisposed: () => Promise<void>;
};

/**
 * A modal component for editing song table columns.
 *
 * @param props - The properties for the ColumnEditModal component
 * @param props.columns - The current columns configuration
 * @param props.isOpen - Boolean indicating if the modal is open
 * @param props.handleColumnsUpdated - Function to handle column updates
 * @param props.handleModalDisposed - Function to handle modal disposal
 * @returns JSX element representing the ColumnEditModal
 */
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
  const inactiveTags = listAllSongMetadataTags().filter(
    (v) => !activeTagsState.includes(v),
  );
  const [selectedInactiveTag, setSelectedInactiveTag] = useState<
    Song_MetadataTag | undefined
  >(undefined);

  // Handlers
  const handleActiveTagSelected = useCallback((tag: Song_MetadataTag) => {
    setSelectedActiveTag(tag);
    setSelectedInactiveTag(undefined);
  }, []);
  const handleInactiveTagSelected = useCallback((tag: Song_MetadataTag) => {
    setSelectedInactiveTag(tag);
    setSelectedActiveTag(undefined);
  }, []);
  const handleItemMovedToActive = useCallback(() => {
    if (selectedInactiveTag !== undefined) {
      setActiveTagsState([...activeTagsState, selectedInactiveTag]);
      setSelectedInactiveTag(undefined);
    }
  }, [activeTagsState, selectedInactiveTag]);
  const handleItemMovedToInactive = useCallback(() => {
    if (selectedActiveTag !== undefined) {
      setActiveTagsState(
        activeTagsState.filter((tag) => tag !== selectedActiveTag),
      );
      setSelectedActiveTag(undefined);
    }
  }, [activeTagsState, selectedActiveTag]);

  const handleSubmit = useCallback(() => {
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

    props.handleColumnsUpdated(newColumns);
  }, [activeTagsState, props]);

  return (
    <>
      <Modal
        isCentered
        closeOnOverlayClick={false}
        isOpen={props.isOpen}
        onClose={() => {
          if (props.handleModalDisposed !== undefined) {
            props.handleModalDisposed();
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
                    handleTagSelected={handleActiveTagSelected}
                  ></ColumnEditModalTagListBox>
                </VStack>
                <VStack>
                  <IconButton
                    aria-label={"Move a selected item to inactive"}
                    icon={<IoChevronForward />}
                    onClick={handleItemMovedToInactive}
                  ></IconButton>
                  <IconButton
                    aria-label={"Move a selected item to active"}
                    icon={<IoChevronBack />}
                    onClick={handleItemMovedToActive}
                  ></IconButton>
                </VStack>
                <VStack>
                  <ColumnEditModalTagListBox
                    title="Inactive Tags"
                    selectedTag={selectedInactiveTag}
                    tags={inactiveTags}
                    handleTagSelected={handleInactiveTagSelected}
                  ></ColumnEditModalTagListBox>
                </VStack>
              </HStack>
            </Center>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="brand" mr={3} onClick={handleSubmit}>
              OK
            </Button>
            <Button onClick={props.handleModalDisposed} colorScheme="gray">
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
