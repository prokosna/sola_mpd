import { FormControl, FormErrorMessage, Select } from "@chakra-ui/react";
import { useCallback, useState } from "react";

import { usePlaylistsState } from "../states/playlistState";

export type PlaylistSelectModalFromListProps = {
  onSelect: (playlistName: string) => void;
};

/**
 * PlaylistSelectModalFromList component
 *
 * This component renders a select input for choosing an existing playlist.
 * It manages the state of selected playlist and any potential error messages.
 *
 * @param props - The props for the PlaylistSelectModalFromList component
 * @param props.onSelect - Callback function to be called when a playlist is selected
 *
 * @returns The rendered PlaylistSelectModalFromList component
 */
export function PlaylistSelectModalFromList(
  props: PlaylistSelectModalFromListProps,
) {
  const playlists = usePlaylistsState();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSelect = useCallback(
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
          onChange={(e) => handleSelect(e.target.value)}
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
