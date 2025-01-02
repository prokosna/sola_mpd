import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import type { SelectionChangedEvent } from "ag-grid-community";
import { useCallback } from "react";

import type { SongTableKey } from "../types/songTableTypes";
import { getSongsInTableFromGrid } from "../utils/songTableTableUtils";

/**
 * Creates handler for song selection changes.
 *
 * Processes grid selection events, retrieving the currently
 * selected songs in their displayed order. Maintains selection
 * state synchronization with the grid.
 *
 * @param songsMap Song lookup map
 * @param onSongsSelected Selection callback
 * @returns Selection change handler
 */
export function useHandleSelectionChange(
	songsMap: Map<SongTableKey, Song>,
	onSongsSelected: (selectedSongs: Song[]) => Promise<void>,
): (event: SelectionChangedEvent) => void {
	return useCallback(
		(event: SelectionChangedEvent) => {
			const { api } = event;
			const { selectedSortedSongs } = getSongsInTableFromGrid(
				undefined,
				api,
				songsMap,
			);
			onSongsSelected(selectedSortedSongs);
		},
		[songsMap, onSongsSelected],
	);
}
