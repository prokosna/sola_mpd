import { useDisclosure, useToast } from "@chakra-ui/react";
import { produce } from "immer";
import { useCallback, useRef } from "react";

import { SongTableContextMenuItem } from "../../global/components/SongTableContextMenu";
import { useAppStore } from "../../global/store/AppStore";
import { usePluginExecutionModalProps } from "../../plugin/hooks/usePluginExecutionModalProps";
import { usePluginState } from "../../plugin/hooks/usePluginState";

import { useBrowserSongs } from "./useBrowserSongs";

import { COMPONENT_ID_BROWSER } from "@/const";
import { MpdRequest } from "@/models/mpd/mpd_command";
import { PluginPluginType } from "@/models/plugin/plugin";
import { Song, SongMetadataTag } from "@/models/song";
import { SongTableColumn } from "@/models/song_table";
import { MpdUtils } from "@/utils/MpdUtils";
import { SongTableKeyType, SongTableUtils } from "@/utils/SongTableUtils";

export type AppliedBrowserFilter = {
  tag: SongMetadataTag;
  values: string[];
};

export function useBrowserSongTable() {
  // In the browser, a unique key is each song path.
  const songTableKeyType = SongTableKeyType.PATH;

  const profile = useAppStore((state) => state.profileState?.currentProfile);
  const browserSongs = useBrowserSongs();
  const commonSongTableState = useAppStore(
    (state) => state.commonSongTableState
  );
  const updateCommonSongTableState = useAppStore(
    (state) => state.updateCommonSongTableState
  );
  const updateSelectedSongs = useAppStore((state) => state.updateSelectedSongs);
  const toast = useToast();
  // Plugin
  const pluginState = usePluginState();
  const pluginProps = usePluginExecutionModalProps();

  // Props for SongGrid
  const onColumnsUpdated = useCallback(
    async (updatedColumns: SongTableColumn[]) => {
      if (commonSongTableState === undefined) {
        return;
      }
      const newCommonSongTableState = produce(commonSongTableState, (draft) => {
        draft.columns = updatedColumns;
      });
      updateCommonSongTableState(newCommonSongTableState);
    },
    [commonSongTableState, updateCommonSongTableState]
  );

  const onSongsSelected = useCallback(
    async (selectedSongs: Song[]) => {
      updateSelectedSongs(selectedSongs);
    },
    [updateSelectedSongs]
  );

  const onDoubleClicked = useCallback(
    async (song: Song, songs: Song[]) => {
      if (profile === undefined) {
        return;
      }
      const addCommand = MpdRequest.create({
        profile,
        command: {
          $case: "add",
          add: { uri: song.path },
        },
      });
      await MpdUtils.command(addCommand);
      const getCommand = MpdRequest.create({
        profile,
        command: {
          $case: "playlistinfo",
          playlistinfo: {},
        },
      });
      const res = await MpdUtils.command(getCommand);
      if (res.command?.$case !== "playlistinfo") {
        throw Error(`Invalid MPD response: ${res}`);
      }
      const queueSongs = res.command.playlistinfo.songs;
      const playCommand = MpdRequest.create({
        profile,
        command: {
          $case: "play",
          play: {
            target: { $case: "pos", pos: String(queueSongs.length - 1) },
          },
        },
      });
      await MpdUtils.command(playCommand);
    },
    [profile]
  );

  const contextMenuItems: SongTableContextMenuItem[][] = [
    [
      {
        name: "Add",
        onClick: async (song: Song | undefined, selectedSongs: Song[]) => {
          if (profile === undefined) {
            return;
          }
          const targetSongs = SongTableUtils.getTrueTargetSongs(
            song,
            selectedSongs,
            songTableKeyType
          );
          if (targetSongs === undefined) {
            return;
          }
          const requests = targetSongs.map((v) =>
            MpdRequest.create({
              profile,
              command: { $case: "add", add: { uri: v.path } },
            })
          );
          await MpdUtils.commandBulk(requests);
          toast({
            status: "success",
            title: "Songs added",
            description: `${targetSongs.length} songs have been added to the play queue.`,
          });
        },
      },
      {
        name: "Replace",
        onClick: async (song: Song | undefined, selectedSongs: Song[]) => {
          if (profile === undefined) {
            return;
          }
          const targetSongs = SongTableUtils.getTrueTargetSongs(
            song,
            selectedSongs,
            songTableKeyType
          );
          if (targetSongs === undefined) {
            return;
          }
          const clearCommand = MpdRequest.create({
            profile,
            command: { $case: "clear", clear: {} },
          });
          const addCommands = targetSongs.map((v) =>
            MpdRequest.create({
              profile,
              command: {
                $case: "add",
                add: { uri: v.path },
              },
            })
          );
          await MpdUtils.commandBulk([clearCommand, ...addCommands]);
          toast({
            status: "success",
            title: "Songs replaced",
            description: `The play queue songs have been replaced with ${targetSongs.length} songs.`,
          });
        },
      },
      {
        name: "Add to Playlist",
        onClick: async (song: Song | undefined, selectedSongs: Song[]) => {
          if (profile === undefined) {
            return;
          }
          const targetSongs = SongTableUtils.getTrueTargetSongs(
            song,
            selectedSongs,
            songTableKeyType
          );
          if (targetSongs === undefined) {
            return;
          }
          latestSelectedSongs.current = targetSongs;
          playlistModal.onOpen();
        },
      },
    ],
    [
      {
        name: "Edit Columns",
        onClick: async () => {
          columnModal.onOpen();
        },
      },
    ],
  ];
  if (pluginState !== undefined) {
    const pluginContextMenuItems: SongTableContextMenuItem[] = [];
    for (const plugin of pluginState.plugins) {
      if (
        plugin.isAvailable &&
        plugin.info?.supportedTypes.includes(PluginPluginType.ON_BROWSER)
      ) {
        pluginContextMenuItems.push({
          name: plugin.info.contextMenuTitle,
          onClick: async (song: Song | undefined, selectedSongs: Song[]) => {
            const targetSongs = SongTableUtils.getTrueTargetSongs(
              song,
              selectedSongs,
              songTableKeyType
            );
            if (targetSongs === undefined) {
              return;
            }
            pluginProps.setPlugin(plugin);
            pluginProps.setSongs(targetSongs);
            pluginProps.onOpen();
          },
        });
      }
    }
    if (pluginContextMenuItems.length > 0) {
      contextMenuItems.push(pluginContextMenuItems);
    }
  }

  // Props for PlaylistModal
  const playlistModal = useDisclosure();
  const latestSelectedSongs = useRef<Song[]>([]);
  const onAddSongsToPlaylist = useCallback(
    async (playlistName: string, excludeDuplications: boolean) => {
      let targetSongs = latestSelectedSongs.current;
      if (excludeDuplications) {
        const req = MpdRequest.create({
          profile,
          command: {
            $case: "listplaylistinfo",
            listplaylistinfo: { name: playlistName },
          },
        });
        const res = await MpdUtils.command(req);
        if (res.command?.$case !== "listplaylistinfo") {
          throw Error(`Invalid MPD response: ${res}`);
        }
        const existingSongs = res.command.listplaylistinfo.songs;
        const existingSongPaths = existingSongs.map((v) => v.path);
        targetSongs = targetSongs.filter(
          (v) => !existingSongPaths.includes(v.path)
        );
      }
      const commands = targetSongs.map((v) =>
        MpdRequest.create({
          profile,
          command: {
            $case: "playlistadd",
            playlistadd: { name: playlistName, uri: v.path },
          },
        })
      );
      await MpdUtils.commandBulk(commands);
      playlistModal.onClose();
      toast({
        status: "success",
        title: "Songs added",
        description: `${targetSongs.length} songs have been added to ${playlistName}.`,
      });
    },
    [playlistModal, profile, toast]
  );
  const onCancelToAddSongsPlaylist = useCallback(async () => {
    latestSelectedSongs.current = [];
    playlistModal.onClose();
  }, [playlistModal]);

  // Props for ColumnModal
  const columnModal = useDisclosure();
  const onUpdateColumns = useCallback(
    async (newColumns: SongTableColumn[]) => {
      if (commonSongTableState === undefined) {
        return;
      }
      const newCommonSongTableState = produce(commonSongTableState, (draft) => {
        draft.columns = newColumns;
      });
      await updateCommonSongTableState(newCommonSongTableState);
      columnModal.onClose();
    },
    [columnModal, commonSongTableState, updateCommonSongTableState]
  );
  const onCancelToUpdateColumns = useCallback(async () => {
    columnModal.onClose();
  }, [columnModal]);

  return {
    tableProps: {
      id: COMPONENT_ID_BROWSER,
      songTableKeyType,
      songs: browserSongs,
      tableColumns: commonSongTableState?.columns || [],
      isSortingEnabled: true,
      isReorderingEnabled: false,
      isGlobalFilterEnabled: true,
      contextMenuItems,
      onSongsReordered: () => {},
      onColumnsUpdated,
      onSongsSelected,
      onDoubleClicked,
    },
    playlistModalProps: {
      isOpen: playlistModal.isOpen,
      onOk: onAddSongsToPlaylist,
      onCancel: onCancelToAddSongsPlaylist,
    },
    columnModalProps: {
      currentColumns: commonSongTableState?.columns || [],
      isOpen: columnModal.isOpen,
      onOk: onUpdateColumns,
      onCancel: onCancelToUpdateColumns,
    },
    pluginModalProps: pluginProps.props,
  };
}
