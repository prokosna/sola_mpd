import {
  Button,
  Checkbox,
  FormControl,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { Playlist } from "@sola_mpd/domain/src/models/playlist_pb.js";
import { useCallback, useState } from "react";

import { useAddPlaylist } from "../states/playlist";

import PlaylistSelectModalFromList from "./PlaylistSelectModalFromList";
import PlaylistSelectModalNewPlaylist from "./PlaylistSelectModalNewPlaylist";

export type PlaylistSelectModalProps = {
  isOpen: boolean;
  isOnly?: "NEW" | "SELECT";
  onOk: (playlist: Playlist) => Promise<void>;
  onCancel: () => Promise<void>;
};

export function PlaylistSelectModal(props: PlaylistSelectModalProps) {
  const addPlaylist = useAddPlaylist();

  const [isCreateNew, setIsCreateNew] = useState(props.isOnly === "NEW");
  const [playlistName, setPlaylistName] = useState("");
  const [isPlaylistNameOk, setIsPlaylistNameOk] = useState(false);

  const onSelect = useCallback((name: string) => {
    setPlaylistName(name);
    setIsPlaylistNameOk(true);
  }, []);

  const onInput = useCallback((name: string, isOk: boolean) => {
    setPlaylistName(name);
    setIsPlaylistNameOk(isOk);
  }, []);

  const onSubmit = useCallback(async () => {
    const playlist = new Playlist({
      name: playlistName,
    });
    if (isCreateNew) {
      if (isPlaylistNameOk) {
        await addPlaylist(playlist);
      } else {
        return;
      }
    }
    props.onOk(playlist);
    setIsCreateNew(props.isOnly === "NEW");
    setIsPlaylistNameOk(false);
  }, [addPlaylist, isCreateNew, isPlaylistNameOk, playlistName, props]);

  const onClose = useCallback(() => {
    setPlaylistName("");
    props.onCancel();
  }, [props]);

  return (
    <>
      <Modal
        isCentered
        closeOnOverlayClick={false}
        isOpen={props.isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select a playlist</ModalHeader>

          <ModalBody pb={6}>
            {isCreateNew ? (
              <PlaylistSelectModalNewPlaylist onInput={onInput} />
            ) : (
              <PlaylistSelectModalFromList onSelect={onSelect} />
            )}
            {props.isOnly === undefined ? (
              <FormControl>
                <Checkbox
                  colorScheme="brand"
                  checked={isCreateNew}
                  onChange={(e) => {
                    setIsCreateNew(e.target.checked);
                    setIsPlaylistNameOk(false);
                  }}
                >
                  Create a new playlist
                </Checkbox>
              </FormControl>
            ) : null}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="brand"
              mr={3}
              onClick={onSubmit}
              isDisabled={playlistName === "" || !isPlaylistNameOk}
            >
              Add
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
