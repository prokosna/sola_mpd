import { useToast } from "@chakra-ui/react";
import { CellContextMenuEvent, SelectionChangedEvent } from "ag-grid-community";
import { useCallback, useEffect, useMemo } from "react";
import { TriggerEvent, useContextMenu } from "react-contexify";

import { GenericContextMenuItem } from "../../global/components/GenericContextMenu";
import { useAppStore } from "../../global/store/AppStore";

import { COMPONENT_ID_PLAYLIST_SIDE_PANE } from "@/const";
import { MpdRequest } from "@/models/mpd/mpd_command";
import { Playlist } from "@/models/playlist";
import { MpdUtils } from "@/utils/MpdUtils";
import { TimeUtils } from "@/utils/TimeUtils";

export type PlaylistSelectContextMenuItem = {
  name: string;
  onClick: (targetPlaylist: Playlist) => Promise<void>;
};

export function usePlaylistSelectList() {
  const profile = useAppStore((state) => state.profileState?.currentProfile);
  const playlists = useAppStore((state) => state.playlists);
  const updateCurrentPlaylist = useAppStore(
    (state) => state.updateCurrentPlaylist,
  );
  const pullPlaylists = useAppStore((state) => state.pullPlaylists);
  const toast = useToast();

  // Initial loading
  useEffect(() => {
    if (profile === undefined) {
      return;
    }
    pullPlaylists(profile);
  }, [profile, pullPlaylists]);

  // Grid props
  const columnDefs = useMemo(() => {
    return [
      {
        field: "Playlist",
        flex: 1,
        resizable: false,
        sortable: false,
        tooltipField: "Metadata",
      },
    ];
  }, []);

  const rowData = useMemo(() => {
    return playlists
      .sort((a, b) => (a.name > b.name ? 1 : -1))
      .map((v) => ({
        ["Playlist"]: v.name,
        ["Metadata"]: `${v.name} modified at ${TimeUtils.convertDateToString(
          v.updatedAt,
        )}`,
      }));
  }, [playlists]);

  const onSelectionChanged = useCallback(
    (event: SelectionChangedEvent) => {
      const { api } = event;
      if (profile === undefined) {
        return;
      }

      const node = api.getSelectedNodes()[0];
      if (node === undefined) {
        return;
      }

      const index = playlists.findIndex(
        (v) => v.name === node.data["Playlist"],
      );
      if (index < 0) {
        return;
      }

      updateCurrentPlaylist(playlists[index]);
    },
    [playlists, profile, updateCurrentPlaylist],
  );

  const contextMenu = useContextMenu({ id: COMPONENT_ID_PLAYLIST_SIDE_PANE });
  const contextMenuItems: GenericContextMenuItem<Playlist>[][] = [
    [
      {
        name: "Delete",
        handlers: [
          [
            "Delete",
            async (selected: Playlist | undefined) => {
              if (profile === undefined || selected === undefined) {
                return;
              }

              const index = playlists.findIndex(
                (v) => v.name === selected.name,
              );
              if (index < 0) {
                return;
              }

              const command = MpdRequest.create({
                profile,
                command: {
                  $case: "rm",
                  rm: { name: selected.name },
                },
              });
              await MpdUtils.command(command);
              pullPlaylists(profile);
              toast({
                status: "success",
                title: "Playlist deleted",
                description: `Playlist ${selected?.name} was deleted.`,
              });
            },
          ],
        ],
      },
    ],
  ];

  const onContextMenuOpen = useCallback(
    (event: CellContextMenuEvent) => {
      const { data } = event;
      const targetName: string | undefined = data["Playlist"];
      if (!event.event) {
        return;
      }

      const targetPlaylist = playlists.filter((v) => v.name === targetName)[0];
      if (targetPlaylist === undefined) {
        return;
      }

      contextMenu.show({
        event: event.event as TriggerEvent,
        props: targetPlaylist,
      });
    },
    [contextMenu, playlists],
  );

  return {
    gridProps: {
      rowData,
      columnDefs,
      onSelectionChanged,
      onContextMenuOpen,
    },
    contextMenuProps: {
      id: COMPONENT_ID_PLAYLIST_SIDE_PANE,
      contextMenuItems,
    },
  };
}
