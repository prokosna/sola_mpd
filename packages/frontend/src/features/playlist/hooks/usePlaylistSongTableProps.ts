import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { Plugin_PluginType } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { MutableRefObject, useCallback } from "react";

import { COMPONENT_ID_PLAYLIST_MAIN_PANE } from "../../../const/component";
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
  getTargetSongsForContextMenu,
  useSetSelectedSongsState,
  SongTableContextMenuItemParams,
  SongTableKeyType,
  useSongTableState,
  useUpdateSongTableState,
  useHandleSongDoubleClick,
  getSongTableKey,
} from "../../song_table";
import { usePlaylistSongsState } from "../states/playlistSongsState";
import { useSelectedPlaylistState } from "../states/playlistState";
import {
  useIsPlaylistLoadingState,
  useSetIsPlaylistLoadingState,
} from "../states/playlistUiState";

/**
 * Hook for playlist song table props.
 *
 * Manages table state, context menus, and song selection
 * for playlist content display.
 *
 * @param songsToAddToPlaylistRef Songs for playlist addition
 * @param setIsPlaylistSelectModalOpen Playlist modal control
 * @param setIsColumnEditModalOpen Column modal control
 * @returns Table props or undefined
 */
export function usePlaylistSongTableProps(
  songsToAddToPlaylistRef: MutableRefObject<Song[]>,
  setIsPlaylistSelectModalOpen: (open: boolean) => void,
  setIsColumnEditModalOpen: (open: boolean) => void,
): SongTableProps | undefined {
  const songTableKeyType = SongTableKeyType.INDEX_PATH;

  const notify = useNotification();

  const profile = useCurrentMpdProfileState();
  const mpdClient = useMpdClientState();
  const isLoading = useIsPlaylistLoadingState();
  const songs = usePlaylistSongsState();
  const songTableState = useSongTableState();
  const selectedPlaylist = useSelectedPlaylistState();
  const setIsPlaylistLoading = useSetIsPlaylistLoadingState();
  const updateSongTableState = useUpdateSongTableState();
  const setSelectedSongs = useSetSelectedSongsState();

  // Plugin context menu items
  const pluginContextMenuItems = usePluginContextMenuItems(
    Plugin_PluginType.ON_PLAYLIST,
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
          {
            name: "Remove",
            onClick: async (params?: SongTableContextMenuItemParams) => {
              if (
                params === undefined ||
                mpdClient === undefined ||
                profile === undefined ||
                selectedPlaylist === undefined
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

              // Playlist doesn't support delete by id but only pos.
              // To effectively remove songs from the playlist,
              // clear the playlist and then add remaining songs again.
              const targetKeys = targetSongs.map((song) =>
                getSongTableKey(song, songTableKeyType),
              );
              const remainingSongs = params.sortedSongs.filter(
                (song) =>
                  !targetKeys.includes(getSongTableKey(song, songTableKeyType)),
              );

              const commands = [
                new MpdRequest({
                  profile,
                  command: {
                    case: "playlistclear",
                    value: { name: selectedPlaylist.name },
                  },
                }),
              ];
              commands.push(
                ...remainingSongs.map(
                  (song) =>
                    new MpdRequest({
                      profile,
                      command: {
                        case: "playlistadd",
                        value: {
                          name: selectedPlaylist.name,
                          uri: song.path,
                        },
                      },
                    }),
                ),
              );
              await mpdClient.commandBulk(commands);
              notify({
                status: "success",
                title: "Songs successfully removed",
                description: `${targetSongs.length} songs have been removed from the playlist "${selectedPlaylist.name}".`,
              });
            },
          },
          {
            name: "Clear",
            onClick: async (params?: SongTableContextMenuItemParams) => {
              if (
                params === undefined ||
                mpdClient === undefined ||
                profile === undefined ||
                selectedPlaylist === undefined
              ) {
                return;
              }
              await mpdClient.command(
                new MpdRequest({
                  profile,
                  command: {
                    case: "playlistclear",
                    value: { name: selectedPlaylist.name },
                  },
                }),
              );
              notify({
                status: "success",
                title: "Songs successfully cleared",
                description: `All songs have been removed from the playlist "${selectedPlaylist.name}".`,
              });
            },
          },
          {
            name: "Drop Duplicates",
            onClick: async (params?: SongTableContextMenuItemParams) => {
              if (
                params === undefined ||
                mpdClient === undefined ||
                profile === undefined ||
                selectedPlaylist === undefined
              ) {
                return;
              }
              if (params.sortedSongs.length === 0) {
                return;
              }

              const uniqueSongs = params.sortedSongs.reduce(
                (uniqueList: Song[], song) =>
                  uniqueList.some((v) => v.path === song.path)
                    ? uniqueList
                    : [...uniqueList, song],
                [],
              );

              if (params.sortedSongs.length === uniqueSongs.length) {
                notify({
                  status: "info",
                  title: "No duplicated songs",
                  description: "There are no duplicated songs to remove.",
                });
                return;
              }

              const commands = [
                new MpdRequest({
                  profile,
                  command: {
                    case: "playlistclear",
                    value: { name: selectedPlaylist.name },
                  },
                }),
              ];
              commands.push(
                ...uniqueSongs.map(
                  (song) =>
                    new MpdRequest({
                      profile,
                      command: {
                        case: "playlistadd",
                        value: {
                          name: selectedPlaylist.name,
                          uri: song.path,
                        },
                      },
                    }),
                ),
              );
              await mpdClient.commandBulk(commands);
              notify({
                status: "success",
                title: "Songs successfully removed",
                description: `${
                  params.sortedSongs.length - uniqueSongs.length
                } duplicated songs have been removed from the playlist "${
                  selectedPlaylist.name
                }".`,
              });
            },
          },
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

  const onSongsReordered = useCallback(
    async (orderedSongs: Song[]) => {
      if (
        profile === undefined ||
        songs === undefined ||
        mpdClient === undefined ||
        selectedPlaylist === undefined
      ) {
        return;
      }

      const commands = [
        new MpdRequest({
          profile,
          command: {
            case: "playlistclear",
            value: { name: selectedPlaylist.name },
          },
        }),
      ];
      commands.push(
        ...orderedSongs.map(
          (song) =>
            new MpdRequest({
              profile,
              command: {
                case: "playlistadd",
                value: {
                  name: selectedPlaylist.name,
                  uri: song.path,
                },
              },
            }),
        ),
      );
      await mpdClient.commandBulk(commands);
    },
    [mpdClient, profile, selectedPlaylist, songs],
  );

  const onColumnsUpdated = useCallback(
    async (updatedColumns: SongTableColumn[]) => {
      if (songTableState === undefined) {
        return;
      }
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
    setIsPlaylistLoading(false);
  }, [setIsPlaylistLoading]);

  if (songs === undefined || songTableState === undefined) {
    return undefined;
  }

  return {
    id: COMPONENT_ID_PLAYLIST_MAIN_PANE,
    songTableKeyType,
    songs,
    columns: songTableState.columns,
    isSortingEnabled: false,
    isReorderingEnabled: true,
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
