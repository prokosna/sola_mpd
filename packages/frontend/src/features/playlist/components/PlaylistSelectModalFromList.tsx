import { FormControl, FormErrorMessage, Select } from "@chakra-ui/react";
import { useCallback, useState } from "react";

import { usePlaylistsState } from "../states/playlist";

export type PlaylistSelectModalFromListProps = {
  onSelect: (playlistName: string) => void;
};

export default function PlaylistSelectModalFromList(
  props: PlaylistSelectModalFromListProps,
) {
  const playlists = usePlaylistsState();
  const [errorMessage, setErrorMessage] = useState("");

  const onSelect = useCallback(
    (name: string) => {
      const playlist = (playlists || []).find(
        (playlist) => playlist.name === name,
      );
      if (playlist === undefined) {
        setErrorMessage(
          "Selected playlist doesn't exist. Please try reloading the browser.",
        );
        return;
      }
      setErrorMessage("");
      props.onSelect(name);
    },
    [playlists, props],
  );

  return (
    <>
      <FormControl isInvalid={errorMessage !== ""}>
        <Select
          placeholder="Select a playlist"
          onChange={(e) => onSelect(e.target.value)}
        >
          {(playlists || []).map((playlist, index) => (
            <option key={index} value={playlist.name}>
              {playlist.name}
            </option>
          ))}
        </Select>
        {errorMessage !== "" ? (
          <FormErrorMessage>{errorMessage}</FormErrorMessage>
        ) : null}
      </FormControl>
    </>
  );
}
