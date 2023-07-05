import { useDisclosure, useToast } from "@chakra-ui/react";
import { produce } from "immer";
import { useCallback, useRef } from "react";

import { SongTableContextMenuItem } from "../../global/components/SongTableContextMenu";
import { useAppStore } from "../../global/store/AppStore";
import { usePluginExecutionModalProps } from "../../plugin/hooks/usePluginExecutionModalProps";
import { usePluginState } from "../../plugin/hooks/usePluginState";

import { usePlayQueueSongs } from "./usePlayQueueSongs";

import { COMPONENT_ID_PLAY_QUEUE } from "@/const";
import { MpdRequest } from "@/models/mpd/mpd_command";
import { PluginPluginType } from "@/models/plugin/plugin";
import { Song, SongMetadataTag } from "@/models/song";
import { SongTableColumn } from "@/models/song_table";
import { MpdUtils } from "@/utils/MpdUtils";
import { SongTableKeyType, SongTableUtils } from "@/utils/SongTableUtils";
import { SongUtils } from "@/utils/SongUtils";

export function usePlayQueueSongTable() {
  // In the play queue, a unique key is ID provided by MPD.
  const songTableKeyType = SongTableKeyType.ID;

  const profile = useAppStore((state) => state.profileState?.currentProfile);
  const currentSong = useAppStore((state) => state.currentSong);
  const playQueueSongs = usePlayQueueSongs();
  const commonSongTableState = useAppStore(
    (state) => state.commonSongTableState
  );
  const updateSelectedSongs = useAppStore((state) => state.updateSelectedSongs);
  const updateCommonSongTableState = useAppStore(
    (state) => state.updateCommonSongTableState
  );
  const toast = useToast();
  // Plugin
  const pluginState = usePluginState();
  const pluginProps = usePluginExecutionModalProps();

  // Props for SongGrid
  const onSongsReordered = useCallback(
    async (orderedSongs: Song[]) => {
      if (profile === undefined) {
        return;
      }
      const ops = SongTableUtils.convertOrderingToOperations(
        playQueueSongs,
        orderedSongs,
        songTableKeyType
      );
      const commands = ops.map((op) =>
        MpdRequest.create({
          profile,
          command: {
            $case: "move",
            move: {
              from: { $case: "fromId", fromId: op.id },
              to: String(op.to),
            },
          },
        })
      );
      await MpdUtils.commandBulk(commands);
    },
    [profile, playQueueSongs, songTableKeyType]
  );

  const onColumnsUpdated = useCallback(
    async (updatedColumns: SongTableColumn[]) => {
      if (commonSongTableState === undefined) {
        return;
      }
      const newCommonSongTableState = produce(commonSongTableState, (draft) => {
        draft.columns = updatedColumns.map((col) => {
          for (const existingCol of commonSongTableState.columns) {
            if (col.tag === existingCol.tag) {
              const newCol = SongTableColumn.create(col);
              newCol.isSortDesc = existingCol.isSortDesc;
              newCol.sortOrder = existingCol.sortOrder;
              return newCol;
            }
          }
          return col;
        });
      });
      await updateCommonSongTableState(newCommonSongTableState);
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
      // Play the double clicked song
      if (profile === undefined) {
        return;
      }
      const command = MpdRequest.create({
        profile,
        command: {
          $case: "play",
          play: {
            target: {
              $case: "id",
              id: SongUtils.getSongMetadataAsString(song, SongMetadataTag.ID),
            },
          },
        },
      });
      await MpdUtils.command(command);
    },
    [profile]
  );

  const getRowClassBySong = useCallback(
    (row: Song) => {
      if (currentSong === undefined) {
        return;
      }
      const rowKey = SongTableUtils.getSongTableKey(songTableKeyType, row);
      const currentSongKey = SongTableUtils.getSongTableKey(
        songTableKeyType,
        currentSong
      );
      if (rowKey === currentSongKey) {
        return "ag-font-weight-bold";
      }
      return;
    },
    [currentSong, songTableKeyType]
  );

  const contextMenuItems: SongTableContextMenuItem[][] = [
    [
      {
        name: "Remove",
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
          const commands = targetSongs.map((v) =>
            MpdRequest.create({
              profile,
              command: {
                $case: "delete",
                delete: {
                  target: {
                    $case: "id",
                    id: SongUtils.getSongMetadataAsString(
                      v,
                      SongMetadataTag.ID
                    ),
                  },
                },
              },
            })
          );
          await MpdUtils.commandBulk(commands);
          toast({
            status: "success",
            title: "Songs removed",
            description: `${targetSongs.length} songs have been removed from the play queue.`,
          });
        },
      },
      {
        name: "Clear",
        onClick: async (song: Song | undefined, selectedSongs: Song[]) => {
          if (profile === undefined) {
            return;
          }
          const command = MpdRequest.create({
            profile,
            command: {
              $case: "clear",
              clear: {},
            },
          });
          await MpdUtils.command(command);
          toast({
            status: "success",
            title: "Songs cleared",
            description: `All songs have been removed from the play queue.`,
          });
        },
      },
      {
        name: "Add to Playlist",
        onClick: (song: Song | undefined, selectedSongs: Song[]) => {
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
        plugin.info?.supportedTypes.includes(PluginPluginType.ON_PLAY_QUEUE)
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
    async (updatedColumns: SongTableColumn[]) => {
      if (commonSongTableState === undefined) {
        return;
      }
      const newCommonSongTableState = produce(commonSongTableState, (draft) => {
        draft.columns = updatedColumns.map((col) => {
          for (const existingCol of commonSongTableState.columns) {
            if (col.tag === existingCol.tag) {
              const newCol = SongTableColumn.create(col);
              newCol.isSortDesc = existingCol.isSortDesc;
              newCol.sortOrder = existingCol.sortOrder;
              return newCol;
            }
          }
          return col;
        });
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
      id: COMPONENT_ID_PLAY_QUEUE,
      songTableKeyType,
      songs: playQueueSongs,
      tableColumns: commonSongTableState?.columns || [],
      isSortingEnabled: false,
      isReorderingEnabled: true,
      isGlobalFilterEnabled: true,
      contextMenuItems,
      onSongsReordered,
      onColumnsUpdated,
      onSongsSelected,
      onDoubleClicked,
      getRowClassBySong,
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
