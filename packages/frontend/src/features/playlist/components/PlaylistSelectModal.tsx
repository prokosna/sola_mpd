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

  const onSelect = useCallback((name: string) => {
    setPlaylistName(name);
  }, []);

  const onInput = useCallback((name: string) => {
    setPlaylistName(name);
  }, []);

  const onSubmit = useCallback(async () => {
    const playlist = new Playlist({
      name: playlistName,
    });
    await addPlaylist(playlist);
    props.onOk(playlist);
  }, [addPlaylist, playlistName, props]);

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
                  onChange={(e) => setIsCreateNew(e.target.checked)}
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
              disabled={playlistName === ""}
            >
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
