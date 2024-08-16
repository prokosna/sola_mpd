import { useDisclosure } from "@chakra-ui/react";
import { Playlist } from "@sola_mpd/domain/src/models/playlist_pb.js";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { useRef } from "react";

import { PlaylistSelectModalProps } from "../components/PlaylistSelectModal";

export function usePlaylistSelectModal(
  addSongsToPlaylistAction: (
    playlist: Playlist,
    songs: Song[],
  ) => Promise<void>,
): [PlaylistSelectModalProps, (selectedSongs: Song[]) => void] {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const targetSongsRef = useRef<Song[]>([]);

  const onOk = async (playlist: Playlist) => {
    addSongsToPlaylistAction(playlist, targetSongsRef.current);
    onClose();
  };

  const onCancel = async () => {
    onClose();
  };

  // const onOk = useCallback(
  //   async (playlist: Playlist) => {
  //     if (profile === undefined || mpdClient === undefined) {
  //       return;
  //     }

  //     const commands = songsToAddToPlaylistRef.current.map(
  //       (song) =>
  //         new MpdRequest({
  //           profile,
  //           command: {
  //             case: "playlistadd",
  //             value: {
  //               name: playlist.name,
  //               uri: song.path,
  //             },
  //           },
  //         }),
  //     );
  //     if (commands.length === 0) {
  //       return;
  //     }

  //     await mpdClient.commandBulk(commands);
  //     setIsOpenPlaylistSelectModal(false);
  //     toast({
  //       status: "success",
  //       title: "Songs successfully added",
  //       description: `${songsToAddToPlaylistRef.current.length} songs have been added to ${playlist.name}.`,
  //     });
  //   },
  //   [
  //     mpdClient,
  //     profile,
  //     setIsOpenPlaylistSelectModal,
  //     songsToAddToPlaylistRef,
  //     toast,
  //   ],
  // );

  // const onCancel = useCallback(async () => {
  //   songsToAddToPlaylistRef.current = [];
  //   setIsOpenPlaylistSelectModal(false);
  // }, [setIsOpenPlaylistSelectModal, songsToAddToPlaylistRef]);

  const open = (selectedSongs: Song[]) => {
    targetSongsRef.current = selectedSongs;
    onOpen();
  };

  return [
    {
      isOpen,
      isOnly: "SELECT",
      onOk,
      onCancel,
    },
    open,
  ];
}
