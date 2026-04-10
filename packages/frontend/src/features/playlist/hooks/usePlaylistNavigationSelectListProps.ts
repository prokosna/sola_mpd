import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import { COMPONENT_ID_PLAYLIST_SIDE_PANE } from "../../../const/component";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import type { ContextMenuSection } from "../../context_menu";
import type { SelectListContextMenuItemParams } from "../../select_list";
import { deletePlaylistActionAtom } from "../states/actions/deletePlaylistActionAtom";
import { setSelectedPlaylistActionAtom } from "../states/actions/setSelectedPlaylistActionAtom";
import {
	playlistsAtom,
	selectedPlaylistAtom,
} from "../states/atoms/playlistAtom";

export function usePlaylistNavigationSelectListProps() {
	const notify = useNotification();

	const playlists = useAtomValue(playlistsAtom);
	const selectedPlaylist = useAtomValue(selectedPlaylistAtom);
	const setSelectedPlaylist = useSetAtom(setSelectedPlaylistActionAtom);
	const deletePlaylist = useSetAtom(deletePlaylistActionAtom);

	const contextMenuSections: ContextMenuSection<SelectListContextMenuItemParams>[] =
		[
			{
				items: [
					{
						name: "Delete",
						onClick: async (params?: SelectListContextMenuItemParams) => {
							if (params === undefined || playlists === undefined) {
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

							await deletePlaylist(params.clickedValue);
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
