import { useToast } from "@chakra-ui/react";
import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { Plugin_PluginType } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { MutableRefObject, useCallback } from "react";

import { COMPONENT_ID_FULL_TEXT_SEARCH } from "../../../const/component";
import { ContextMenuSection } from "../../context_menu";
import { useMpdClientState } from "../../mpd";
import { usePluginContextMenuItems } from "../../plugin";
import { useCurrentMpdProfileState } from "../../profile";
import {
  getSongTableContextMenuAddToPlaylist,
  getSongTableContextMenuEditColumns,
  SongTableProps,
  useOnUpdateCommonColumns,
  useCommonSongTableState,
  useSetSelectedSongsState,
  SongTableContextMenuItemParams,
  SongTableKeyType,
  getSongTableContextMenuAdd,
  getSongTableContextMenuReplace,
} from "../../song_table";
import { useFullTextSearchVisibleSongsState } from "../states/songs";
import {
  useIsFullTextSearchLoadingState,
  useSetIsFullTextSearchLoadingState,
} from "../states/ui";

export function useFullTextSearchSongTableProps(
  songsToAddToPlaylistRef: MutableRefObject<Song[]>,
  setIsOpenPlaylistSelectModal: (open: boolean) => void,
  setIsOpenColumnEditModal: (open: boolean) => void,
): SongTableProps | undefined {
  const songTableKeyType = SongTableKeyType.PATH;

  const toast = useToast();
  const profile = useCurrentMpdProfileState();
  const songs = useFullTextSearchVisibleSongsState();
  const commonSongTableState = useCommonSongTableState();
  const mpdClient = useMpdClientState();
  const isLoading = useIsFullTextSearchLoadingState();
  const setIsLoading = useSetIsFullTextSearchLoadingState();
  const setSelectedSongs = useSetSelectedSongsState();
  const onUpdateColumns = useOnUpdateCommonColumns(commonSongTableState, true);
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

  const onReorderSongs = useCallback(async (_orderedSongs: Song[]) => {
    throw new Error("Reorder songs must be disabled in Full-Text Search.");
  }, []);

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
    id: COMPONENT_ID_FULL_TEXT_SEARCH,
    songTableKeyType,
    songs,
    columns: commonSongTableState.columns,
    isSortingEnabled: true,
    isReorderingEnabled: false,
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
