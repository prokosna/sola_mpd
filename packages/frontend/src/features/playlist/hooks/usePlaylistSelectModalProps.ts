import { useToast } from "@chakra-ui/react";
import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { Playlist } from "@sola_mpd/domain/src/models/playlist_pb.js";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { MutableRefObject, useCallback } from "react";

import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
import { PlaylistSelectModalProps } from "../components/PlaylistSelectModal";

export function usePlaylistSelectModalProps(
  isOpen: boolean,
  songsToAddToPlaylistRef: MutableRefObject<Song[]>,
  setIsOpenPlaylistSelectModal: (open: boolean) => void,
): PlaylistSelectModalProps {
  const toast = useToast();

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
      setIsOpenPlaylistSelectModal(false);
      toast({
        status: "success",
        title: "Songs successfully added",
        description: `${songsToAddToPlaylistRef.current.length} songs have been added to ${playlist.name}.`,
      });
    },
    [
      mpdClient,
      profile,
      setIsOpenPlaylistSelectModal,
      songsToAddToPlaylistRef,
      toast,
    ],
  );

  const onCancel = useCallback(async () => {
    songsToAddToPlaylistRef.current = [];
    setIsOpenPlaylistSelectModal(false);
  }, [setIsOpenPlaylistSelectModal, songsToAddToPlaylistRef]);

  return {
    isOpen,
    isOnly: undefined,
    onOk,
    onCancel,
  };
}
