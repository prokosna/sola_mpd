import { useToast } from "@chakra-ui/react";
import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { useCallback } from "react";

import { COMPONENT_ID_PLAYLIST_SIDE_PANE } from "../../../const/component";
import { ContextMenuSection } from "../../context_menu";
import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
import {
  SelectListProps,
  SelectListContextMenuItemParams,
} from "../../select_list";
import {
  usePlaylistsState,
  useSelectedPlaylistState,
  useSetSelectedPlaylistState,
} from "../states/playlist";

export function usePlaylistNavigationSelectListProps():
  | SelectListProps
  | undefined {
  const toast = useToast();

  const profile = useCurrentMpdProfileState();
  const mpdClient = useMpdClientState();
  const playlists = usePlaylistsState();
  const selectedPlaylist = useSelectedPlaylistState();
  const setSelectedPlaylist = useSetSelectedPlaylistState();

  const contextMenuSections: ContextMenuSection<SelectListContextMenuItemParams>[] =
    [
      {
        items: [
          {
            name: "Delete",
            onClick: async (params?: SelectListContextMenuItemParams) => {
              if (
                params === undefined ||
                profile === undefined ||
                mpdClient === undefined ||
                playlists === undefined
              ) {
                return;
              }

              const index = playlists.findIndex(
                (playlist) => playlist.name === params.clickedValue,
              );
              if (index < 0) {
                return;
              }

              await mpdClient.command(
                new MpdRequest({
                  profile,
                  command: {
                    case: "rm",
                    value: {
                      name: params.clickedValue,
                    },
                  },
                }),
              );
              toast({
                status: "success",
                title: "Playlist successfully deleted",
                description: `Playlist "${params.clickedValue}" has been deleted.`,
              });
            },
          },
        ],
      },
    ];

  const onSelectValues = useCallback(
    async (selectedValues: string[]) => {
      if (selectedValues.length >= 2) {
        throw new Error("Multiple playlists are selected.");
      } else if (selectedValues.length === 1) {
        const playlist = playlists?.find(
          (playlist) => playlist.name === selectedValues[0],
        );
        setSelectedPlaylist(playlist);
      } else {
        setSelectedPlaylist(undefined);
      }
    },
    [playlists, setSelectedPlaylist],
  );

  const onCompleteLoading = async () => {};

  if (playlists === undefined) {
    return;
  }

  return {
    id: COMPONENT_ID_PLAYLIST_SIDE_PANE,
    values: playlists.map((playlist) => playlist.name),
    selectedValues: selectedPlaylist ? [selectedPlaylist.name] : [],
    header: undefined,
    contextMenuSections,
    isLoading: false,
    allowMultipleSelection: false,
    onSelectValues,
    onCompleteLoading,
  };
}
