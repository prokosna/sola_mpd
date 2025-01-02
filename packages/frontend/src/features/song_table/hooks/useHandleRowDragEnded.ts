import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import type { RowDragEndEvent } from "ag-grid-community";
import { useCallback } from "react";

import type { SongTableKey } from "../types/songTableTypes";
import { getSongsInTableFromGrid } from "../utils/songTableTableUtils";

/**
 * Creates handler for song row drag-and-drop events.
 *
 * Processes row reordering events, retrieving the updated song
 * order from the grid. Ensures song list state stays synchronized
 * with visual row order.
 *
 * @param songsMap Song lookup map
 * @param onSongsReordered Reorder callback
 * @returns Drag end event handler
 */
export function useHandleRowDragEnded(
	songsMap: Map<SongTableKey, Song>,
	onSongsReordered: (orderedSongs: Song[]) => Promise<void>,
): (event: RowDragEndEvent) => void {
	return useCallback(
		(event: RowDragEndEvent) => {
			const { api } = event;
			const { sortedSongs } = getSongsInTableFromGrid(undefined, api, songsMap);
			onSongsReordered(sortedSongs);
		},
		[songsMap, onSongsReordered],
	);
}
