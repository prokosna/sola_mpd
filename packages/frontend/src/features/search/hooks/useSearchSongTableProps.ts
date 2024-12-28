import { Plugin_PluginType } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { MutableRefObject, useCallback } from "react";

import { COMPONENT_ID_SEARCH_MAIN_PANE } from "../../../const/component";
import { useNotification } from "../../../lib/chakra/hooks/useNotification";
import { ContextMenuSection } from "../../context_menu";
import { useMpdClientState } from "../../mpd";
import { usePluginContextMenuItems } from "../../plugin";
import { useCurrentMpdProfileState } from "../../profile";
import {
  getSongTableContextMenuAdd,
  getSongTableContextMenuReplace,
  getSongTableContextMenuAddToPlaylist,
  getSongTableContextMenuEditColumns,
  SongTableProps,
  useSetSelectedSongsState,
  SongTableKeyType,
  SongTableContextMenuItemParams,
  useSongTableState,
  useHandleSongDoubleClick,
} from "../../song_table";
import { useEditingSearchState } from "../states/searchEditState";
import { useSearchSongsState } from "../states/searchSongsState";
import {
  useIsSearchLoadingState,
  useSetIsSearchLoadingState,
} from "../states/searchUiState";

import { useHandleSearchColumnsUpdated } from "./useHandleSearchColumnsUpdated";

/**
 * Custom hook for managing Search Song Table properties.
 *
 * This hook handles the state and callbacks for the search song table,
 * including context menu actions, song selection, and table updates.
 *
 * @param songsToAddToPlaylistRef - Mutable reference to store songs for playlist addition.
 * @param setIsPlaylistSelectModalOpen - Function to set the visibility of the playlist select modal.
 * @param setIsColumnEditModalOpen - Function to set the visibility of the column edit modal.
 * @returns SongTableProps object or undefined if data is not ready.
 */
export function useSearchSongTableProps(
  songsToAddToPlaylistRef: MutableRefObject<Song[]>,
  setIsPlaylistSelectModalOpen: (open: boolean) => void,
  setIsColumnEditModalOpen: (open: boolean) => void,
): SongTableProps | undefined {
  const songTableKeyType = SongTableKeyType.PATH;

  const notify = useNotification();

  const profile = useCurrentMpdProfileState();
  const mpdClient = useMpdClientState();
  const isLoading = useIsSearchLoadingState();
  const songs = useSearchSongsState();
  const editingSearch = useEditingSearchState();
  const songTableState = useSongTableState();
  const setIsSearchLoading = useSetIsSearchLoadingState();
  const setSelectedSongs = useSetSelectedSongsState();
  const handleSearchColumnsUpdated = useHandleSearchColumnsUpdated();

  // Plugin context menu items
  const pluginContextMenuItems = usePluginContextMenuItems(
    Plugin_PluginType.ON_SAVED_SEARCH,
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
    throw new Error("Reorder songs is not supported in Search.");
  }, []);

  const onColumnsUpdated = useCallback(
    async (updatedColumns: SongTableColumn[]) => {
      handleSearchColumnsUpdated(editingSearch, updatedColumns);
    },
    [editingSearch, handleSearchColumnsUpdated],
  );

  const onSongsSelected = useCallback(
    async (selectedSongs: Song[]) => {
      setSelectedSongs(selectedSongs);
    },
    [setSelectedSongs],
  );

  const onSongDoubleClick = useHandleSongDoubleClick(mpdClient, profile);

  const onLoadingCompleted = useCallback(async () => {
    setIsSearchLoading(false);
  }, [setIsSearchLoading]);

  if (songs === undefined || songTableState === undefined) {
    return undefined;
  }

  return {
    id: COMPONENT_ID_SEARCH_MAIN_PANE,
    songTableKeyType,
    songs,
    columns:
      editingSearch.columns.length !== 0
        ? editingSearch.columns
        : songTableState.columns,
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
