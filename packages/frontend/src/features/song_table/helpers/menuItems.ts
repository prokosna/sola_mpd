import { useToast } from "@chakra-ui/react";
import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { MutableRefObject } from "react";

import { ContextMenuItem } from "../../context_menu";
import { MpdClient } from "../../mpd";
import {
  SongTableContextMenuItemParams,
  SongTableKeyType,
} from "../types/songTable";

import { getTargetSongsForContextMenu } from "./table";

export function getSongTableContextMenuAdd(
  songTableKeyType: SongTableKeyType,
  toast: ReturnType<typeof useToast>,
  profile?: MpdProfile,
  mpdClient?: MpdClient,
): ContextMenuItem<SongTableContextMenuItemParams> {
  return {
    name: "Add",
    onClick: async (params?: SongTableContextMenuItemParams) => {
      if (
        params === undefined ||
        mpdClient === undefined ||
        profile === undefined
      ) {
        return;
      }
      const targetSongs = getTargetSongsForContextMenu(
        params,
        songTableKeyType,
      );
      if (targetSongs.length === 0) {
        return;
      }
      const commands = targetSongs.map(
        (song) =>
          new MpdRequest({
            profile,
            command: {
              case: "add",
              value: {
                uri: song.path,
              },
            },
          }),
      );
      await mpdClient.commandBulk(commands);
      toast({
        status: "success",
        title: "Songs successfully added",
        description: `${targetSongs.length} songs have been added to the play queue.`,
      });
    },
  };
}

export function getSongTableContextMenuReplace(
  songTableKeyType: SongTableKeyType,
  toast: ReturnType<typeof useToast>,
  profile?: MpdProfile,
  mpdClient?: MpdClient,
): ContextMenuItem<SongTableContextMenuItemParams> {
  return {
    name: "Replace",
    onClick: async (params?: SongTableContextMenuItemParams) => {
      if (
        params === undefined ||
        mpdClient === undefined ||
        profile === undefined
      ) {
        return;
      }
      const targetSongs = getTargetSongsForContextMenu(
        params,
        songTableKeyType,
      );
      if (targetSongs.length === 0) {
        return;
      }
      const commands = [
        new MpdRequest({
          profile,
          command: {
            case: "clear",
            value: {},
          },
        }),
      ];
      commands.push(
        ...targetSongs.map(
          (song) =>
            new MpdRequest({
              profile,
              command: {
                case: "add",
                value: {
                  uri: song.path,
                },
              },
            }),
        ),
      );
      await mpdClient.commandBulk(commands);
      toast({
        status: "success",
        title: "Songs successfully replaced",
        description: `The play queue has been replaced with ${targetSongs.length} songs.`,
      });
    },
  };
}

export function getSongTableContextMenuAddToPlaylist(
  songTableKeyType: SongTableKeyType,
  songsToAddToPlaylistRef: MutableRefObject<Song[]>,
  setIsOpenPlaylistSelectModal: (open: boolean) => void,
): ContextMenuItem<SongTableContextMenuItemParams> {
  return {
    name: "Add to Playlist",
    onClick: async (params?: SongTableContextMenuItemParams) => {
      if (params === undefined) {
        return;
      }
      const targetSongs = getTargetSongsForContextMenu(
        params,
        songTableKeyType,
      );
      if (targetSongs.length === 0) {
        return;
      }
      songsToAddToPlaylistRef.current = targetSongs;
      setIsOpenPlaylistSelectModal(true);
    },
  };
}

export function getSongTableContextMenuEditColumns(
  setIsOpenColumnEditModal: (open: boolean) => void,
): ContextMenuItem<SongTableContextMenuItemParams> {
  return {
    name: "Edit Columns",
    onClick: async (_params?: SongTableContextMenuItemParams) => {
      setIsOpenColumnEditModal(true);
    },
  };
}
