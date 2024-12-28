import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { Playlist } from "@sola_mpd/domain/src/models/playlist_pb.js";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { useCallback, useRef, useState } from "react";

import { useNotification } from "../../../lib/chakra/hooks/useNotification";
import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";

/**
 * Custom hook for managing playlist select modal functionality.
 *
 * This hook provides state and callbacks for handling the playlist select modal,
 * including opening/closing the modal and managing the selection of songs to be
 * added to a playlist.
 *
 * @returns An object containing the modal's open state and callbacks for handling modal actions.
 */
export function usePlaylistSelectModal() {
  const notify = useNotification();

  const songsToAddToPlaylistRef = useRef<Song[]>([]);
  const [isPlaylistSelectModalOpen, setIsPlaylistSelectModalOpen] =
    useState(false);

  const profile = useCurrentMpdProfileState();
  const mpdClient = useMpdClientState();

  const onOk = useCallback(
    async (playlist: Playlist) => {
      if (profile === undefined || mpdClient === undefined) {
        return;
      }

      const commands = songsToAddToPlaylistRef.current.map(
        (song) =>
          new MpdRequest({
            profile,
            command: {
              case: "playlistadd",
              value: {
                name: playlist.name,
                uri: song.path,
              },
            },
          }),
      );
      if (commands.length === 0) {
        return;
      }

      await mpdClient.commandBulk(commands);
      setIsPlaylistSelectModalOpen(false);
      notify({
        status: "success",
        title: "Songs successfully added",
        description: `${songsToAddToPlaylistRef.current.length} songs have been added to ${playlist.name}.`,
      });
    },
    [mpdClient, notify, profile, songsToAddToPlaylistRef],
  );

  const onCancel = useCallback(async () => {
    songsToAddToPlaylistRef.current = [];
    setIsPlaylistSelectModalOpen(false);
  }, [setIsPlaylistSelectModalOpen, songsToAddToPlaylistRef]);

  return {
    songsToAddToPlaylistRef,
    setIsPlaylistSelectModalOpen,
    playlistSelectModalProps: {
      isOpen: isPlaylistSelectModalOpen,
      onOk,
      onCancel,
    },
  };
}
