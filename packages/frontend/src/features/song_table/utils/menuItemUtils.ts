import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { MutableRefObject } from "react";

import { NotificationParams } from "../../../lib/chakra/hooks/useNotification";
import { ContextMenuItem } from "../../context_menu";
import { MpdClient } from "../../mpd";
import {
  SongTableContextMenuItemParams,
  SongTableKeyType,
} from "../types/songTableTypes";

import { getTargetSongsForContextMenu } from "./tableUtils";

/**
 * Creates a context menu item for adding songs to the current MPD queue.
 * This function generates a menu item that, when clicked, will add the selected songs
 * to the end of the current MPD queue.
 *
 * @param songTableKeyType - The type of key used in the song table for identifying songs.
 * @param showNotification - Function for displaying notifications.
 * @param profile - Optional MPD profile configuration.
 * @param mpdClient - Optional MPD client instance for sending commands.
 * @returns A context menu item configuration for adding songs to the queue.
 */
export function getSongTableContextMenuAdd(
  songTableKeyType: SongTableKeyType,
  showNotification: (params: NotificationParams) => void,
  profile?: MpdProfile,
  mpdClient?: MpdClient,
): ContextMenuItem<SongTableContextMenuItemParams> {
  return {
    name: "Add",
    onClick: async (params?: SongTableContextMenuItemParams): Promise<void> => {
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
      showNotification({
        title: "Added songs to queue",
        description: `${targetSongs.length} songs have been added to the play queue.`,
        status: "success",
      });
    },
  };
}

/**
 * Creates a context menu item for replacing the current MPD queue with selected songs.
 * This function generates a menu item that, when clicked, will clear the current queue
 * and add the selected songs.
 *
 * @param songTableKeyType - The type of key used in the song table for identifying songs.
 * @param showNotification - Function for displaying notifications.
 * @param profile - Optional MPD profile configuration.
 * @param mpdClient - Optional MPD client instance for sending commands.
 * @returns A context menu item configuration for replacing the queue.
 */
export function getSongTableContextMenuReplace(
  songTableKeyType: SongTableKeyType,
  showNotification: (params: NotificationParams) => void,
  profile?: MpdProfile,
  mpdClient?: MpdClient,
): ContextMenuItem<SongTableContextMenuItemParams> {
  return {
    name: "Replace",
    onClick: async (params?: SongTableContextMenuItemParams): Promise<void> => {
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
      showNotification({
        title: "Replaced queue with selected songs",
        description: `The play queue has been replaced with ${targetSongs.length} songs.`,
        status: "success",
      });
    },
  };
}

/**
 * Creates a context menu item for adding songs to a playlist.
 * This function generates a menu item that, when clicked, will store the selected songs
 * and open a playlist selection modal.
 *
 * @param songTableKeyType - The type of key used in the song table for identifying songs.
 * @param songsToAddToPlaylistRef - Reference to store songs that will be added to a playlist.
 * @param setIsOpenPlaylistSelectModal - Function to control the visibility of the playlist selection modal.
 * @returns A context menu item configuration for adding songs to a playlist.
 */
export function getSongTableContextMenuAddToPlaylist(
  songTableKeyType: SongTableKeyType,
  songsToAddToPlaylistRef: MutableRefObject<Song[]>,
  setIsOpenPlaylistSelectModal: (open: boolean) => void,
): ContextMenuItem<SongTableContextMenuItemParams> {
  return {
    name: "Add to Playlist",
    onClick: async (params?: SongTableContextMenuItemParams): Promise<void> => {
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

/**
 * Creates a context menu item for editing table columns.
 * This function generates a menu item that, when clicked, will open the column edit modal.
 *
 * @param setIsOpenColumnEditModal - Function to control the visibility of the column edit modal.
 * @returns A context menu item configuration for editing table columns.
 */
export function getSongTableContextMenuEditColumns(
  setIsOpenColumnEditModal: (open: boolean) => void,
): ContextMenuItem<SongTableContextMenuItemParams> {
  return {
    name: "Edit Columns",
    onClick: async (): Promise<void> => {
      setIsOpenColumnEditModal(true);
    },
  };
}
