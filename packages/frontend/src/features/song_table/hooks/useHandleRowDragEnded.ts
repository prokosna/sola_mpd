import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import type { RowDragEndEvent } from "ag-grid-community";
import { useCallback } from "react";
import { getSongsInTableFromGrid } from "../functions/songTableState";
import type { SongTableKey } from "../types/songTableTypes";

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
