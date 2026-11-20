import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { useSetAtom } from "jotai";
import type { MutableRefObject } from "react";

import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import type { ContextMenuItem, ContextMenuSection } from "../../context_menu";
import {
	buildSongTableContextMenuSections,
	getSongTableContextMenuAdd,
	getSongTableContextMenuAddToPlaylist,
	getSongTableContextMenuCopy,
	getSongTableContextMenuEditColumns,
	getSongTableContextMenuReplace,
	getSongTableContextMenuResetLayout,
} from "../functions/songTableMenuItem";
import { addSongsToQueueActionAtom } from "../states/actions/addSongsToQueueActionAtom";
import { copySongsToClipboardActionAtom } from "../states/actions/copySongsToClipboardActionAtom";
import { replaceQueueWithSongsActionAtom } from "../states/actions/replaceQueueWithSongsActionAtom";
import { resetSongTableLayoutActionAtom } from "../states/actions/resetSongTableLayoutActionAtom";
import type {
	SongTableContextMenuItemParams,
	SongTableKeyType,
} from "../types/songTableTypes";

type SongTableContextMenuItems =
	ContextMenuItem<SongTableContextMenuItemParams>[];

export type SongTableContextMenuSectionsParams = {
	songTableKeyType: SongTableKeyType;
	hasQueueItems: boolean;
	/** Sections for the table's own source, placed right after Add/Replace. */
	sourceSections: SongTableContextMenuItems[];
	/** Sections such as Similar Songs or plugins. */
	extraSections: SongTableContextMenuItems[];
	songsToAddToPlaylistRef: MutableRefObject<Song[]>;
	setIsPlaylistSelectModalOpen: (open: boolean) => void;
	setIsColumnEditModalOpen: (open: boolean) => void;
	resetLayout?: () => void;
};

export function useSongTableContextMenuSections(
	params: SongTableContextMenuSectionsParams,
): ContextMenuSection<SongTableContextMenuItemParams>[] {
	const notify = useNotification();
	const addSongsToQueue = useSetAtom(addSongsToQueueActionAtom);
	const replaceQueueWithSongs = useSetAtom(replaceQueueWithSongsActionAtom);
	const copySongsToClipboard = useSetAtom(copySongsToClipboardActionAtom);
	const resetSongTableLayout = useSetAtom(resetSongTableLayoutActionAtom);

	const { songTableKeyType } = params;
	return buildSongTableContextMenuSections([
		params.hasQueueItems
			? [
					getSongTableContextMenuAdd(songTableKeyType, notify, addSongsToQueue),
					getSongTableContextMenuReplace(
						songTableKeyType,
						notify,
						replaceQueueWithSongs,
					),
				]
			: [],
		...params.sourceSections,
		[
			getSongTableContextMenuAddToPlaylist(
				songTableKeyType,
				params.songsToAddToPlaylistRef,
				params.setIsPlaylistSelectModalOpen,
			),
		],
		[
			getSongTableContextMenuCopy(
				songTableKeyType,
				notify,
				copySongsToClipboard,
			),
		],
		[
			getSongTableContextMenuEditColumns(params.setIsColumnEditModalOpen),
			getSongTableContextMenuResetLayout(
				params.resetLayout ?? resetSongTableLayout,
			),
		],
		...params.extraSections,
	]);
}
