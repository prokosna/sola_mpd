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

import { getTargetSongsForContextMenu } from "./songTableTableUtils";

/**
 * Creates menu item for adding songs to queue.
 *
 * Generates item that appends selected songs to current MPD
 * queue. Handles song selection and MPD command dispatch.
 * Shows notification on completion.
 *
 * @param songTableKeyType Song key type
 * @param showNotification Notification handler
 * @param profile MPD profile
 * @param mpdClient MPD client
 * @returns Context menu item
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
        status: "success",
        title: "Added songs to queue",
        description: `${targetSongs.length} songs have been added to the play queue.`,
      });
    },
  };
}

/**
 * Creates menu item for replacing queue.
 *
 * Generates item that clears current queue and adds selected
 * songs. Handles song selection and MPD command sequence.
 * Shows notification on completion.
 *
 * @param songTableKeyType Song key type
 * @param showNotification Notification handler
 * @param profile MPD profile
 * @param mpdClient MPD client
 * @returns Context menu item
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
        status: "success",
        title: "Replaced queue with selected songs",
        description: `The play queue has been replaced with ${targetSongs.length} songs.`,
      });
    },
  };
}

/**
 * Creates menu item for playlist addition.
 *
 * Generates item that stores selected songs and opens
 * playlist selection modal. Manages song reference state
 * for later playlist addition.
 *
 * @param songTableKeyType Song key type
 * @param songsToAddToPlaylistRef Song selection ref
 * @param setIsPlaylistSelectModalOpen Modal state setter
 * @returns Context menu item
 */
export function getSongTableContextMenuAddToPlaylist(
  songTableKeyType: SongTableKeyType,
  songsToAddToPlaylistRef: MutableRefObject<Song[]>,
  setIsPlaylistSelectModalOpen: (open: boolean) => void,
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
      setIsPlaylistSelectModalOpen(true);
    },
  };
}

/**
 * Creates menu item for column configuration.
 *
 * Generates item that opens column edit modal. Provides
 * access to table column customization interface.
 *
 * @param setIsColumnEditModalOpen Modal state setter
 * @returns Context menu item
 */
export function getSongTableContextMenuEditColumns(
  setIsColumnEditModalOpen: (open: boolean) => void,
): ContextMenuItem<SongTableContextMenuItemParams> {
  return {
    name: "Edit Columns",
    onClick: async (): Promise<void> => {
      setIsColumnEditModalOpen(true);
    },
  };
}
