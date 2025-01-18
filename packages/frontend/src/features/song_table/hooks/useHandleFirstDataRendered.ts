import type { FirstDataRenderedEvent } from "ag-grid-community";
import { useCallback } from "react";
import { useCurrentSongState } from "../../player";
import type { SongTableKeyType } from "../types/songTableTypes";
import {
	getSongTableKey,
	getTableIndexOfSong,
} from "../utils/songTableTableUtils";

/**
 * Custom hook to handle the first data rendered event in a song table.
 *
 * This hook returns a callback function that can be used to handle the
 * FirstDataRenderedEvent from ag-grid. It optionally scrolls to the
 * currently playing song when the data is first rendered.
 *
 * @param keyType - The type of key used for identifying songs in the table
 * @param scrollToPlayingSong - Whether to scroll to the currently playing song
 * @returns A callback function to handle the FirstDataRenderedEvent
 */
export function useHandleFirstDataRendered(
	keyType: SongTableKeyType,
	scrollToPlayingSong: boolean,
): (event: FirstDataRenderedEvent) => void {
	const currentSong = useCurrentSongState();

	return useCallback(
		(event: FirstDataRenderedEvent) => {
			const { api } = event;

			if (!scrollToPlayingSong) {
				return;
			}

			const currentSongKey = currentSong
				? getSongTableKey(currentSong, keyType)
				: undefined;

			if (currentSongKey === undefined) {
				return;
			}

			const currentSongRowIndex = getTableIndexOfSong(currentSongKey, api);

			if (currentSongRowIndex === undefined) {
				return;
			}

			api.ensureIndexVisible(currentSongRowIndex, "top");
		},
		[currentSong, keyType, scrollToPlayingSong],
	);
}
