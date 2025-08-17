import { create } from "@bufbuild/protobuf";
import { MpdRequestSchema } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { useCallback } from "react";

import { COMPONENT_ID_PLAYLIST_SIDE_PANE } from "../../../const/component";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import type { ContextMenuSection } from "../../context_menu";
import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
import type { SelectListContextMenuItemParams } from "../../select_list";
import {
	usePlaylistsState,
	useSelectedPlaylistState,
	useSetSelectedPlaylistState,
} from "../states/playlistState";

/**
 * Hook for playlist navigation list props.
 *
 * Provides selection and context menu functionality
 * for playlist management.
 *
 * @returns SelectList props or undefined
 */
export function usePlaylistNavigationSelectListProps() {
	const notify = useNotification();

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

							if (params.clickedValue === selectedPlaylist?.name) {
								setSelectedPlaylist(undefined);
							}

							await mpdClient.command(
								create(MpdRequestSchema, {
									profile,
									command: {
										case: "rm",
										value: {
											name: params.clickedValue,
										},
									},
								}),
							);
							notify({
								status: "success",
								title: "Playlist successfully deleted",
								description: `Playlist "${params.clickedValue}" has been deleted.`,
							});
						},
					},
				],
			},
		];

	const onItemsSelected = useCallback(
		async (selectedValues: string[]) => {
			if (selectedValues.length >= 2) {
				throw new Error("Multiple playlists are selected.");
			}
			if (selectedValues.length === 1) {
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

	if (playlists === undefined) {
		return;
	}

	return {
		id: COMPONENT_ID_PLAYLIST_SIDE_PANE,
		values: playlists.map((playlist) => playlist.name),
		selectedValues: selectedPlaylist ? [selectedPlaylist.name] : [],
		headerTitle: "Playlists",
		contextMenuSections,
		isLoading: false,
		allowMultipleSelection: false,
		onItemsSelected: onItemsSelected,
		onLoadingCompleted: async () => {},
	};
}
