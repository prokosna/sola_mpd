import { FormControl, FormErrorMessage, Input } from "@chakra-ui/react";
import { useCallback, useState } from "react";

import { usePlaylistsState } from "../states/playlist";

export type PlaylistSelectModalNewPlaylistProps = {
  onInput: (playlistName: string) => void;
};

export default function PlaylistSelectModalNewPlaylist(
  props: PlaylistSelectModalNewPlaylistProps,
) {
  const playlists = usePlaylistsState();
  const [errorMessage, setErrorMessage] = useState("");

  const onInput = useCallback(
    (name: string) => {
      if (name === "") {
        return;
      }
      const playlist = (playlists || []).find(
        (playlist) => playlist.name === name,
      );
      if (playlist !== undefined) {
        setErrorMessage("The playlist name is already used.");
        return;
      }
      setErrorMessage("");
      props.onInput(name);
    },
    [playlists, props],
  );

  return (
    <>
      <FormControl isInvalid={errorMessage !== ""}>
        <Input onChange={(e) => onInput(e.target.value)}></Input>
        {errorMessage !== "" ? (
          <FormErrorMessage>{errorMessage}</FormErrorMessage>
        ) : null}
      </FormControl>
    </>
  );
}
