import { Plugin_PluginType } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { MutableRefObject, useCallback } from "react";

import { COMPONENT_ID_FILE_EXPLORE_MAIN_PANE } from "../../../const/component";
import { useNotification } from "../../../lib/chakra/hooks/useNotification";
import { UpdateMode } from "../../../types/stateTypes";
import { ContextMenuSection } from "../../context_menu";
import { useMpdClientState } from "../../mpd";
import { usePluginContextMenuItems } from "../../plugin";
import { useCurrentMpdProfileState } from "../../profile";
import {
  getSongTableContextMenuAdd,
  getSongTableContextMenuAddToPlaylist,
  getSongTableContextMenuEditColumns,
  getSongTableContextMenuReplace,
  SongTableProps,
  useSetSelectedSongsState,
  SongTableKeyType,
  SongTableContextMenuItemParams,
  useSongTableState,
  useUpdateSongTableState,
  useHandleSongDoubleClick,
} from "../../song_table";
import { useFileExploreSongsState } from "../states/fileExploreSongsState";
import {
  useIsFileExploreLoadingState,
  useSetIsFileExploreLoadingState,
} from "../states/fileExploreUiState";

/**
 * Custom hook for managing File Explorer Song Table properties.
 *
 * This hook handles the state and callbacks for the file explorer song table,
 * including context menu actions, song selection, and table updates.
 *
 * @param songsToAddToPlaylistRef - Mutable reference to store songs for playlist addition.
 * @param setIsOpenPlaylistSelectModal - Function to set the visibility of the playlist select modal.
 * @param setIsOpenColumnEditModal - Function to set the visibility of the column edit modal.
 * @returns SongTableProps object or undefined if data is not ready.
 */
export function useFileExploreSongTableProps(
  songsToAddToPlaylistRef: MutableRefObject<Song[]>,
  setIsOpenPlaylistSelectModal: (open: boolean) => void,
  setIsOpenColumnEditModal: (open: boolean) => void,
): SongTableProps | undefined {
  const songTableKeyType = SongTableKeyType.PATH;

  const notify = useNotification();

  const profile = useCurrentMpdProfileState();
  const mpdClient = useMpdClientState();
  const isLoading = useIsFileExploreLoadingState();
  const songs = useFileExploreSongsState();
  const songTableState = useSongTableState();
  const setIsFileExploreLoading = useSetIsFileExploreLoadingState();
  const updateSongTableState = useUpdateSongTableState();
  const setSelectedSongs = useSetSelectedSongsState();

  // Plugin context menu items
  const pluginContextMenuItems = usePluginContextMenuItems(
    Plugin_PluginType.ON_FILE_EXPLORE,
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
            setIsOpenPlaylistSelectModal,
          ),
        ],
      },
      {
        items: [getSongTableContextMenuEditColumns(setIsOpenColumnEditModal)],
      },
    ];
  if (pluginContextMenuItems.length > 0) {
    contextMenuSections.push({
      items: pluginContextMenuItems,
    });
  }

  // Handlers
  const onSongsReordered = useCallback(async (_orderedSongs: Song[]) => {
    throw new Error("Reorder songs shouldn't be supported in FileExplore.");
  }, []);

  const onColumnsUpdated = useCallback(
    async (updatedColumns: SongTableColumn[]) => {
      const newSongTableState = songTableState.clone();
      newSongTableState.columns = updatedColumns;
      updateSongTableState(newSongTableState, UpdateMode.PERSIST);
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
    setIsFileExploreLoading(false);
  }, [setIsFileExploreLoading]);

  if (songs === undefined || songTableState === undefined) {
    return undefined;
  }

  return {
    id: COMPONENT_ID_FILE_EXPLORE_MAIN_PANE,
    songTableKeyType,
    songs,
    columns: songTableState.columns,
    isSortingEnabled: false,
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
