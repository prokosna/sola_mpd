import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import type { RowDoubleClickedEvent } from "ag-grid-community";
import { useCallback } from "react";
import { getSongsInTableFromGrid } from "../functions/songTableState";
import type { SongTableKey } from "../types/songTableTypes";

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
