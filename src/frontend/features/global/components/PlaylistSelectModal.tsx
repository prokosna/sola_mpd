"use client";
import {
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useToast,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useAppStore } from "../store/AppStore";

import { MpdRequest } from "@/models/mpd/mpd_command";
import { MpdUtils } from "@/utils/MpdUtils";

export type PlaylistSelectModalProps = {
  isOpen: boolean;
  isOnly?: "NEW" | "SELECT";
  onOk: (playlistName: string, excludeDuplications: boolean) => Promise<void>;
  onCancel: () => Promise<void>;
};

export default function PlaylistSelectModal(props: PlaylistSelectModalProps) {
  const { isOpen, isOnly, onOk, onCancel } = props;
  const profile = useAppStore((state) => state.profileState?.currentProfile);
  const playlistMetadataList = useAppStore((state) => state.playlists);
  const pullPlaylistMetadataList = useAppStore((state) => state.pullPlaylists);
  const toast = useToast();

  // Make sure to pull playlist metadata list
  useEffect(() => {
    if (profile === undefined) {
      return;
    }
    pullPlaylistMetadataList(profile);
  }, [profile, pullPlaylistMetadataList]);

  const [selectedName, setSelectedName] = useState("");
  const [newName, setNewName] = useState("");
  const [createNew, setCreateNew] = useState(isOnly === "NEW");
  const [excludeDuplications, setExcludeDuplications] = useState(false);
  const [errorMessageSelect, setErrorMessageSelect] = useState("");
  const [errorMessageNew, setErrorMessageNew] = useState("");

  const existingNames = useMemo(() => {
    return Array.from(playlistMetadataList.map((v) => v.name)).sort((a, b) =>
      a > b ? 1 : -1
    );
  }, [playlistMetadataList]);

  const reset = useCallback(() => {
    setSelectedName("");
    setNewName("");
    setCreateNew(false);
    setExcludeDuplications(false);
    setErrorMessageSelect("");
    setErrorMessageNew("");
  }, []);

  const onSubmitted = useCallback(async () => {
    if (profile === undefined) {
      return;
    }
    if (createNew) {
      if (newName === "") {
        setErrorMessageNew("Playlist name is empty.");
        return;
      }
      if (playlistMetadataList.some((v) => v.name === newName)) {
        setErrorMessageNew("This name is already used.");
        return;
      }
      const commandSave = MpdRequest.create({
        profile,
        command: {
          $case: "save",
          save: { name: newName },
        },
      });
      const commandClear = MpdRequest.create({
        profile,
        command: {
          $case: "playlistclear",
          playlistclear: { name: newName },
        },
      });
      await MpdUtils.commandBulk([commandSave, commandClear]);
      toast({
        status: "success",
        title: "Playlist created",
        description: `Playlist ${newName} has been created.`,
      });
      await onOk(newName, excludeDuplications);
      reset();
    } else {
      if (selectedName === "") {
        setErrorMessageSelect("Please select a playlist.");
        return;
      }
      await onOk(selectedName, excludeDuplications);
      reset();
    }
  }, [
    profile,
    createNew,
    newName,
    playlistMetadataList,
    toast,
    onOk,
    excludeDuplications,
    reset,
    selectedName,
  ]);

  const onClose = useCallback(() => {
    reset();
    onCancel();
  }, [onCancel, reset]);

  return (
    <>
      <Modal
        isCentered
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select a playlist</ModalHeader>

          <ModalBody pb={6}>
            {createNew ? (
              <FormControl isInvalid={errorMessageNew !== ""}>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                ></Input>
                {errorMessageNew !== "" ? (
                  <FormErrorMessage>{errorMessageNew}</FormErrorMessage>
                ) : null}
              </FormControl>
            ) : (
              <FormControl isInvalid={errorMessageSelect !== ""}>
                <Select
                  placeholder="Select a playlist"
                  onChange={(e) => setSelectedName(e.target.value)}
                >
                  {existingNames.map((v, i) => (
                    <option key={i} value={v}>
                      {v}
                    </option>
                  ))}
                </Select>
                {errorMessageSelect !== "" ? (
                  <FormErrorMessage>{errorMessageSelect}</FormErrorMessage>
                ) : null}
              </FormControl>
            )}
            {isOnly === undefined ? (
              <FormControl>
                <Checkbox
                  colorScheme="brand"
                  checked={createNew}
                  onChange={(e) => setCreateNew(e.target.checked)}
                >
                  Create a new playlist
                </Checkbox>
              </FormControl>
            ) : null}
            <FormControl>
              <Checkbox
                colorScheme="brand"
                checked={excludeDuplications}
                onChange={(e) => setExcludeDuplications(e.target.checked)}
              >
                Exclude duplications
              </Checkbox>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="brand" mr={3} onClick={onSubmitted}>
              OK
            </Button>
            <Button onClick={onClose} colorScheme="gray">
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
