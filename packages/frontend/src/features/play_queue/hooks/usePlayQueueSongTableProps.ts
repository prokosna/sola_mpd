import { useToast } from "@chakra-ui/react";
import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { Plugin_PluginType } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { Song, Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongUtils } from "@sola_mpd/domain/src/utils/SongUtils.js";
import { MutableRefObject, useCallback } from "react";

import { COMPONENT_ID_PLAY_QUEUE } from "../../../const/component";
import { ContextMenuSection } from "../../context_menu";
import { useMpdClientState } from "../../mpd";
import { usePluginContextMenuItems } from "../../plugin";
import { useCurrentMpdProfileState } from "../../profile";
import {
  getSongTableContextMenuAddToPlaylist,
  getSongTableContextMenuEditColumns,
  SongTableProps,
  convertOrderingToOperations,
  getTargetSongsForContextMenu,
  useOnUpdateCommonColumns,
  useCommonSongTableState,
  useSetSelectedSongsState,
  SongTableContextMenuItemParams,
  SongTableKeyType,
} from "../../song_table";
import { usePlayQueueVisibleSongsState } from "../states/songs";
import {
  useIsPlayQueueLoadingState,
  useSetIsPlayQueueLoadingState,
} from "../states/ui";

export function usePlayQueueSongTableProps(
  songsToAddToPlaylistRef: MutableRefObject<Song[]>,
  setIsOpenPlaylistSelectModal: (open: boolean) => void,
  setIsOpenColumnEditModal: (open: boolean) => void,
): SongTableProps | undefined {
  const songTableKeyType = SongTableKeyType.ID;

  const toast = useToast();
  const profile = useCurrentMpdProfileState();
  const songs = usePlayQueueVisibleSongsState();
  const commonSongTableState = useCommonSongTableState();
  const mpdClient = useMpdClientState();
  const isLoading = useIsPlayQueueLoadingState();
  const setIsLoading = useSetIsPlayQueueLoadingState();
  const setSelectedSongs = useSetSelectedSongsState();
  const onUpdateColumns = useOnUpdateCommonColumns(commonSongTableState, false);
  const pluginContextMenuItems = usePluginContextMenuItems(
    Plugin_PluginType.ON_PLAY_QUEUE,
    songTableKeyType,
  );

  const contextMenuSections: ContextMenuSection<SongTableContextMenuItemParams>[] =
    [
      {
        items: [
          {
            name: "Remove",
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
                      case: "delete",
                      value: {
                        target: {
                          case: "id",
                          value: SongUtils.getSongMetadataAsString(
                            song,
                            Song_MetadataTag.ID,
                          ),
                        },
                      },
                    },
                  }),
              );
              await mpdClient.commandBulk(commands);
              toast({
                status: "success",
                title: "Songs successfully removed",
                description: `${targetSongs.length} songs have been removed from the play queue.`,
              });
            },
          },
          {
            name: "Clear",
            onClick: async (params?: SongTableContextMenuItemParams) => {
              if (
                params === undefined ||
                mpdClient === undefined ||
                profile === undefined
              ) {
                return;
              }
              await mpdClient.command(
                new MpdRequest({
                  profile,
                  command: {
                    case: "clear",
                    value: {},
                  },
                }),
              );
              toast({
                status: "success",
                title: "Songs successfully cleared",
                description: "All songs have been removed from the play queue.",
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
        mpdClient === undefined
      ) {
        return;
      }
      const ops = convertOrderingToOperations(
        songs,
        orderedSongs,
        songTableKeyType,
      );
      const commands = ops.map(
        (op) =>
          new MpdRequest({
            profile,
            command: {
              case: "move",
              value: {
                from: { case: "fromId", value: op.id },
                to: String(op.to),
              },
            },
          }),
      );
      await mpdClient.commandBulk(commands);
    },
    [mpdClient, profile, songTableKeyType, songs],
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
      await mpdClient.command(
        new MpdRequest({
          profile,
          command: {
            case: "play",
            value: {
              target: {
                case: "id",
                value: SongUtils.getSongMetadataAsString(
                  clickedSong,
                  Song_MetadataTag.ID,
                ),
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
    id: COMPONENT_ID_PLAY_QUEUE,
    songTableKeyType: SongTableKeyType.ID,
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
