import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import type { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import type { CellContextMenuEvent } from "ag-grid-community";
import { type RefObject, useCallback } from "react";
import { type TriggerEvent, useContextMenu } from "react-contexify";

import type {
	SongTableContextMenuItemParams,
	SongTableKey,
	SongTableKeyType,
} from "../types/songTableTypes";
import {
	convertAgGridColumnsToSongTableColumns,
	copySortingAttributesToNewColumns,
} from "../utils/songTableColumnUtils";
import {
	getSongsInTableFromGrid,
	getSongTableKey,
} from "../utils/songTableTableUtils";

/**
 * Creates handler for song table context menu.
 *
 * Opens a context menu with song-specific actions, managing grid
 * state and column configurations. Provides access to selected
 * songs and current table state.
 *
 * @param id Context menu identifier
 * @param keyType Row key type
 * @param songsMap Song lookup map
 * @param columns Column config
 * @param isSortingEnabled Enable sorting
 * @returns Context menu handler
 */
export function useOpenContextMenu(
	id: string,
	keyType: SongTableKeyType,
	songsMap: Map<SongTableKey, Song>,
	columns: SongTableColumn[],
	isSortingEnabled: boolean,
	contextMenuAnchorRef?: RefObject<HTMLElement | null>,
): (event: CellContextMenuEvent) => void {
	const contextMenu = useContextMenu({ id });
	return useCallback(
		(event: CellContextMenuEvent) => {
			const { api, data } = event;
			const targetSongKey: string | undefined = data?.key;
			if (targetSongKey == null) {
				return;
			}
			if (!event.event) {
				return;
			}

			const updatedColumns = convertAgGridColumnsToSongTableColumns(
				api.getAllGridColumns(),
			);
			const currentColumns = isSortingEnabled
				? updatedColumns
				: copySortingAttributesToNewColumns(updatedColumns, columns);

			let { clickedSong, sortedSongs, selectedSortedSongs } =
				getSongsInTableFromGrid(targetSongKey, api, songsMap);

			if (clickedSong === undefined) {
				return;
			}

			// If a user selects only 1 single song, but opens the context menu
			// on another song, then the selected single song should be ignored.
			if (selectedSortedSongs.length === 1 && clickedSong !== undefined) {
				const firstKey = getSongTableKey(selectedSortedSongs[0], keyType);
				const targetKey = getSongTableKey(clickedSong, keyType);
				if (firstKey !== targetKey) {
					selectedSortedSongs = [];
				}
			}

			const props: SongTableContextMenuItemParams = {
				columns: currentColumns,
				clickedSong,
				sortedSongs,
				selectedSortedSongs,
			};

			const triggerEvent = event.event as TriggerEvent;
			const mouseEvent = event.event as MouseEvent;
			const anchorRect =
				contextMenuAnchorRef?.current?.getBoundingClientRect?.() ?? undefined;
			const x =
				anchorRect && mouseEvent?.clientX != null
					? mouseEvent.clientX - anchorRect.left
					: mouseEvent?.clientX;
			const y =
				anchorRect && mouseEvent?.clientY != null
					? mouseEvent.clientY - anchorRect.top
					: mouseEvent?.clientY;
			contextMenu.show({
				event: triggerEvent,
				position: x != null && y != null ? { x, y } : undefined,
				props,
			});
		},
		[
			columns,
			contextMenu,
			contextMenuAnchorRef,
			isSortingEnabled,
			keyType,
			songsMap,
		],
	);
}
