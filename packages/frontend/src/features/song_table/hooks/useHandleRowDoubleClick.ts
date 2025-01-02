import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import type { RowDoubleClickedEvent } from "ag-grid-community";
import { useCallback } from "react";

import type { SongTableKey } from "../types/songTableTypes";
import { getSongsInTableFromGrid } from "../utils/songTableTableUtils";

/**
 * Creates handler for song row double-click events.
 *
 * Processes double-click events on table rows, retrieving the
 * clicked song and current song list order. Maintains grid
 * state synchronization during interactions.
 *
 * @param songsMap Song lookup map
 * @param onDoubleClick Double-click callback
 * @returns Double-click event handler
 */
export function useHandleRowDoubleClick(
	songsMap: Map<SongTableKey, Song>,
	onDoubleClick: (clickedSong: Song, songs: Song[]) => Promise<void>,
): (event: RowDoubleClickedEvent) => void {
	return useCallback(
		(event: RowDoubleClickedEvent) => {
			const { api, data } = event;
			const targetKey: string | undefined = data.key;
			if (targetKey == null) {
				return;
			}
			if (!event.event) {
				return;
			}

			const { clickedSong, sortedSongs } = getSongsInTableFromGrid(
				targetKey,
				api,
				songsMap,
			);
			if (clickedSong === undefined) {
				return;
			}
			onDoubleClick(clickedSong, sortedSongs);
		},
		[songsMap, onDoubleClick],
	);
}
