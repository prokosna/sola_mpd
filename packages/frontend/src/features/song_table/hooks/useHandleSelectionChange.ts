import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import type { SelectionChangedEvent } from "ag-grid-community";
import { useCallback } from "react";
import { getSongsInTableFromGrid } from "../functions/songTableState";
import type { SongTableKey } from "../types/songTableTypes";

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
