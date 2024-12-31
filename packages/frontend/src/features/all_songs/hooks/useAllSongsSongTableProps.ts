import { Plugin_PluginType } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { MutableRefObject, useCallback } from "react";

import { COMPONENT_ID_FULL_TEXT_SEARCH } from "../../../const/component";
import { useNotification } from "../../../lib/chakra/hooks/useNotification";
import { UpdateMode } from "../../../types/stateTypes";
import { ContextMenuSection } from "../../context_menu";
import { useMpdClientState } from "../../mpd";
import { usePluginContextMenuItems } from "../../plugin";
import { useCurrentMpdProfileState } from "../../profile";
import {
  getSongTableContextMenuAddToPlaylist,
  getSongTableContextMenuEditColumns,
  SongTableProps,
  useSetSelectedSongsState,
  SongTableContextMenuItemParams,
  SongTableKeyType,
  getSongTableContextMenuAdd,
  getSongTableContextMenuReplace,
  useSongTableState,
  useUpdateSongTableState,
  useHandleSongDoubleClick,
} from "../../song_table";
import { useAllSongsState } from "../states/allSongsState";
import {
  useIsAllSongsLoadingState,
  useSetIsAllSongsLoadingState,
} from "../states/allSongsUiState";

/**
 * Custom hook for managing All Songs Table properties.
 *
 * This hook handles the state and callbacks for the all songs table,
 * including context menu actions, song selection, and table updates.
 *
 * @param songsToAddToPlaylistRef - Mutable reference to store songs for playlist addition.
 * @param setIsPlaylistSelectModalOpen - Function to set the visibility of the playlist select modal.
 * @param setIsColumnEditModalOpen - Function to set the visibility of the column edit modal.
 * @returns SongTableProps object or undefined if data is not ready.
 */
export function useAllSongsSongTableProps(
  songsToAddToPlaylistRef: MutableRefObject<Song[]>,
  setIsPlaylistSelectModalOpen: (open: boolean) => void,
  setIsColumnEditModalOpen: (open: boolean) => void,
): SongTableProps | undefined {
  const songTableKeyType = SongTableKeyType.PATH;

  const notify = useNotification();

  const profile = useCurrentMpdProfileState();
  const mpdClient = useMpdClientState();
  const isLoading = useIsAllSongsLoadingState();
  const songs = useAllSongsState();
  const songTableState = useSongTableState();
  const setIsAllSongsLoading = useSetIsAllSongsLoadingState();
  const updateSongTableState = useUpdateSongTableState();
  const setSelectedSongs = useSetSelectedSongsState();

  // Plugin context menu items
  const pluginContextMenuItems = usePluginContextMenuItems(
    Plugin_PluginType.ON_FULL_TEXT_SEARCH,
    songTableKeyType,
  );

  const contextMenuSections: ContextMenuSection<SongTableContextMenuItemParams>[] =
    [
      {
        items: [
          getSongTableContextMenuAdd(
            songTableKeyType,
            notify,
            profile,
            mpdClient,
          ),
          getSongTableContextMenuReplace(
            songTableKeyType,
            notify,
            profile,
            mpdClient,
          ),
        ],
      },
      {
        items: [
          getSongTableContextMenuAddToPlaylist(
            songTableKeyType,
            songsToAddToPlaylistRef,
            setIsPlaylistSelectModalOpen,
          ),
        ],
      },
      {
        items: [getSongTableContextMenuEditColumns(setIsColumnEditModalOpen)],
      },
    ];
  if (pluginContextMenuItems.length > 0) {
    contextMenuSections.push({
      items: pluginContextMenuItems,
    });
  }

  // Handlers
  const onSongsReordered = useCallback(async (_orderedSongs: Song[]) => {
    throw new Error("Reorder songs must be disabled in AllSongs.");
  }, []);

  const onColumnsUpdated = useCallback(
    async (updatedColumns: SongTableColumn[]) => {
      if (songTableState === undefined) {
        return;
      }
      const newSongTableState = songTableState.clone();
      newSongTableState.columns = updatedColumns;
      await updateSongTableState(newSongTableState, UpdateMode.PERSIST);
    },
    [songTableState, updateSongTableState],
  );

  const onSongsSelected = useCallback(
    async (selectedSongs: Song[]) => {
      setSelectedSongs(selectedSongs);
    },
    [setSelectedSongs],
  );

  const onSongDoubleClick = useHandleSongDoubleClick(mpdClient, profile);

  const onLoadingCompleted = useCallback(async () => {
    setIsAllSongsLoading(false);
  }, [setIsAllSongsLoading]);

  if (songs === undefined || songTableState === undefined) {
    return undefined;
  }

  return {
    id: COMPONENT_ID_FULL_TEXT_SEARCH,
    songTableKeyType,
    songs,
    columns: songTableState.columns,
    isSortingEnabled: true,
    isReorderingEnabled: false,
    isGlobalFilterEnabled: true,
    contextMenuSections,
    isLoading,
    onSongsReordered,
    onColumnsUpdated,
    onSongsSelected,
    onSongDoubleClick,
    onLoadingCompleted,
  };
}
