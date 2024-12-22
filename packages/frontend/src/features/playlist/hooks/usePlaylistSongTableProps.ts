import { useToast } from "@chakra-ui/react";
import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { Plugin_PluginType } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { MutableRefObject, useCallback } from "react";

import { COMPONENT_ID_PLAYLIST_MAIN_PANE } from "../../../const/component";
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
  getTableKeyOfSong,
  getTargetSongsForContextMenu,
  useOnUpdateCommonColumns,
  useCommonSongTableState,
  useSetSelectedSongsState,
  SongTableContextMenuItemParams,
  SongTableKeyType,
} from "../../song_table";
import { useSelectedPlaylistState } from "../states/playlist";
import { usePlaylistVisibleSongsState } from "../states/songs";
import {
  useIsPlaylistLoadingState,
  useSetIsPlaylistLoadingState,
} from "../states/ui";

export function usePlaylistSongTableProps(
  songsToAddToPlaylistRef: MutableRefObject<Song[]>,
  setIsOpenPlaylistSelectModal: (open: boolean) => void,
  setIsOpenColumnEditModal: (open: boolean) => void,
): SongTableProps | undefined {
  const songTableKeyType = SongTableKeyType.INDEX_PATH;

  const toast = useToast();
  const profile = useCurrentMpdProfileState();
  const songs = usePlaylistVisibleSongsState();
  const commonSongTableState = useCommonSongTableState();
  const mpdClient = useMpdClientState();
  const isLoading = useIsPlaylistLoadingState();
  const selectedPlaylist = useSelectedPlaylistState();
  const setIsLoading = useSetIsPlaylistLoadingState();
  const setSelectedSongs = useSetSelectedSongsState();
  const onUpdateColumns = useOnUpdateCommonColumns(commonSongTableState);
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
            toast,
            profile,
            mpdClient,
          ),
          getSongTableContextMenuReplace(
            songTableKeyType,
            toast,
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
                getTableKeyOfSong(song, songTableKeyType),
              );
              const remainingSongs = params.sortedSongs.filter(
                (song) =>
                  !targetKeys.includes(
                    getTableKeyOfSong(song, songTableKeyType),
                  ),
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
              toast({
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
              toast({
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
                toast({
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
              toast({
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

  const onReorderSongs = useCallback(
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

  const onSelectSongs = useCallback(
    async (selectedSongs: Song[]) => {
      setSelectedSongs(selectedSongs);
    },
    [setSelectedSongs],
  );

  const onDoubleClick = useCallback(
    async (clickedSong: Song) => {
      if (profile === undefined || mpdClient === undefined) {
        return;
      }
      const addCommand = new MpdRequest({
        profile,
        command: {
          case: "add",
          value: { uri: clickedSong.path },
        },
      });
      await mpdClient.command(addCommand);
      const getCommand = new MpdRequest({
        profile,
        command: {
          case: "playlistinfo",
          value: {},
        },
      });
      const res = await mpdClient.command(getCommand);
      if (res.command.case !== "playlistinfo") {
        throw Error(`Invalid MPD response: ${res.toJsonString()}`);
      }
      const playQueueSongs = res.command.value.songs;
      await mpdClient.command(
        new MpdRequest({
          profile,
          command: {
            case: "play",
            value: {
              target: {
                case: "pos",
                value: String(playQueueSongs.length - 1),
              },
            },
          },
        }),
      );
    },
    [mpdClient, profile],
  );

  const onCompleteLoading = useCallback(async () => {
    setIsLoading(false);
  }, [setIsLoading]);

  if (songs === undefined || commonSongTableState === undefined) {
    return undefined;
  }

  return {
    id: COMPONENT_ID_PLAYLIST_MAIN_PANE,
    songTableKeyType,
    songs,
    columns: commonSongTableState.columns,
    isSortingEnabled: false,
    isReorderingEnabled: true,
    isGlobalFilterEnabled: true,
    contextMenuSections,
    isLoading,
    reorderSongs: onReorderSongs,
    updateColumns: onUpdateColumns,
    selectSongs: onSelectSongs,
    doubleClickSong: onDoubleClick,
    completeLoading: onCompleteLoading,
  };
}
