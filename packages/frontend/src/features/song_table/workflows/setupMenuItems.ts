import { Song } from "@sola_mpd/domain/src/models/song_pb.js";

import { ContextMenuItem } from "../../context_menu";
import {
  SongTableContextMenuItemParams,
  SongTableKeyType,
} from "../types/songTableTypes";

import { getTargetSongsForContextMenu } from "./convertAgGridTableSongs";

export function getSongTableContextMenuAdd(
  songTableKeyType: SongTableKeyType,
  addSongsToPlayQueueAction: (songs: Song[]) => Promise<void>,
  showToastAction: (title: string, message: string) => void,
): ContextMenuItem<SongTableContextMenuItemParams> {
  return {
    type: "Item",
    name: "Add",
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
      addSongsToPlayQueueAction(targetSongs);
      showToastAction(
        "Songs successfully added",
        `${targetSongs.length} songs have been added to the play queue.`,
      );
    },
  };
}

export function getSongTableContextMenuReplace(
  songTableKeyType: SongTableKeyType,
  replaceSongsOfPlayQueueAction: (songs: Song[]) => Promise<void>,
  showToastAction: (title: string, message: string) => void,
): ContextMenuItem<SongTableContextMenuItemParams> {
  return {
    type: "Item",
    name: "Replace",
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
      replaceSongsOfPlayQueueAction(targetSongs);
      showToastAction(
        "Songs successfully replaced",
        `The play queue has been replaced with ${targetSongs.length} songs.`,
      );
    },
  };
}

export function getSongTableContextMenuAddToPlaylist(
  songTableKeyType: SongTableKeyType,
  openAddToPlaylistModal: (songs: Song[]) => void,
): ContextMenuItem<SongTableContextMenuItemParams> {
  return {
    type: "Item",
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
      openAddToPlaylistModal(targetSongs);
    },
  };
}

export function getSongTableContextMenuEditColumns(
  openColumnEditModalAction: () => void,
): ContextMenuItem<SongTableContextMenuItemParams> {
  return {
    type: "Item",
    name: "Edit Columns",
    onClick: async (_params?: SongTableContextMenuItemParams) => {
      openColumnEditModalAction();
    },
  };
}
