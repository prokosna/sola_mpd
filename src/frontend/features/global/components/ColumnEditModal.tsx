"use client";
import {
  Box,
  Button,
  Center,
  HStack,
  IconButton,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import { produce } from "immer";
import React, { useCallback, useEffect, useState } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

import { SongMetadataTag } from "@/models/song";
import { SongTableColumn } from "@/models/song_table";
import { SongTableUtils } from "@/utils/SongTableUtils";
import { SongUtils } from "@/utils/SongUtils";

export type ColumnEditModalProps = {
  currentColumns: SongTableColumn[];
  isOpen: boolean;
  onOk: (newColumns: SongTableColumn[]) => Promise<void>;
  onCancel: () => Promise<void>;
};

export default function ColumnEditModal(props: ColumnEditModalProps) {
  const { currentColumns, isOpen, onOk, onCancel } = props;

  const [inUseTagsState, setInUseTagsState] = useState<SongMetadataTag[]>([]);
  const availableTags = SongUtils.listAllSongMetadataTags().filter(
    (v) => !inUseTagsState.includes(v),
  );

  useEffect(() => {
    if (isOpen) {
      setInUseTagsState(currentColumns.map((v) => v.tag));
    }
  }, [currentColumns, isOpen]);

  const [selectedAvailableTag, setSelectedAvailableTag] = useState<
    SongMetadataTag | undefined
  >(undefined);
  const [selectedInUseTag, setSelectedInUseTag] = useState<
    SongMetadataTag | undefined
  >(undefined);

  const onSelectAvailableTag = useCallback((tag: SongMetadataTag) => {
    setSelectedAvailableTag(tag);
    setSelectedInUseTag(undefined);
  }, []);
  const onSelectInUseTag = useCallback((tag: SongMetadataTag) => {
    setSelectedAvailableTag(undefined);
    setSelectedInUseTag(tag);
  }, []);

  const onMoveItemToInUse = useCallback(() => {
    if (selectedAvailableTag !== undefined) {
      setInUseTagsState([...inUseTagsState, selectedAvailableTag]);
      setSelectedAvailableTag(undefined);
    }
  }, [inUseTagsState, selectedAvailableTag]);
  const onMoveItemFromInUse = useCallback(() => {
    if (selectedInUseTag !== undefined) {
      setInUseTagsState(inUseTagsState.filter((v) => v !== selectedInUseTag));
      setSelectedInUseTag(undefined);
    }
  }, [inUseTagsState, selectedInUseTag]);

  const onSubmitted = useCallback(() => {
    // Remove
    let newColumns = SongTableUtils.normalizeMetadataColumns(
      currentColumns.filter((v) => inUseTagsState.includes(v.tag)),
    );

    // Add
    const flexWidthSum = newColumns
      .map((v) => v.widthFlex)
      .reduce((a, b) => a + b, 0);
    const flexWidthAvg = flexWidthSum / newColumns.length || 0;
    newColumns = produce(newColumns, (draft) => {
      for (const tag of inUseTagsState) {
        if (newColumns.every((v) => v.tag !== tag)) {
          draft.push(
            SongTableColumn.create({
              tag,
              widthFlex: flexWidthAvg,
              isSortDesc: false,
            }),
          );
        }
      }
    });

    onOk(newColumns);
  }, [currentColumns, inUseTagsState, onOk]);

  return (
    <>
      <Modal
        isCentered
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={onCancel}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit columns</ModalHeader>

          <ModalBody pb={6}>
            <Center>
              <HStack>
                <VStack>
                  <Text>Available tags</Text>
                  <Box
                    w="180px"
                    h="200px"
                    border={"solid 1px"}
                    borderColor={"gray.300"}
                    overflow={"auto"}
                  >
                    <List>
                      {availableTags.map((v, index) => {
                        const isSelected = v === selectedAvailableTag;
                        return (
                          <ListItem key={index}>
                            <Button
                              ml={2}
                              w="90%"
                              variant={isSelected ? "solid" : "ghost"}
                              _hover={{
                                variant: "outline",
                              }}
                              onClick={() => onSelectAvailableTag(v)}
                            >
                              {SongTableUtils.convertSongMetadataTagToDisplayName(
                                v,
                              )}
                            </Button>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Box>
                </VStack>
                <VStack>
                  <IconButton
                    aria-label={"move_to_in_use"}
                    icon={<IoChevronForward />}
                    onClick={onMoveItemToInUse}
                  ></IconButton>
                  <IconButton
                    aria-label={"move_from_in_use"}
                    icon={<IoChevronBack />}
                    onClick={onMoveItemFromInUse}
                  ></IconButton>
                </VStack>
                <VStack>
                  <Text>Tags in use</Text>
                  <Box
                    w="180px"
                    h="200px"
                    border={"solid 1px"}
                    borderColor={"gray.300"}
                    overflow={"auto"}
                  >
                    <List>
                      {inUseTagsState.map((v, index) => {
                        const isSelected = v === selectedInUseTag;
                        return (
                          <ListItem key={index}>
                            <Button
                              ml={2}
                              w="90%"
                              variant={isSelected ? "solid" : "ghost"}
                              _hover={{
                                variant: "outline",
                              }}
                              onClick={() => onSelectInUseTag(v)}
                            >
                              {SongTableUtils.convertSongMetadataTagToDisplayName(
                                v,
                              )}
                            </Button>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Box>
                </VStack>
              </HStack>
            </Center>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="brand" mr={3} onClick={onSubmitted}>
              OK
            </Button>
            <Button onClick={onCancel} colorScheme="gray">
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
