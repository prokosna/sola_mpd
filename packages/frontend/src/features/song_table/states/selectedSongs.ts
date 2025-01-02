import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

/**
 * Global state atom for currently selected songs.
 *
 * Maintains list of songs selected in the visible table.
 */
const selectedSongsAtom = atom<Song[]>([]);

/**
 * Hook to access currently selected songs.
 *
 * Retrieves the list of songs currently selected in the
 * visible table for use in operations like playback or
 * playlist management.
 *
 * @returns Selected song list
 */
export function useSelectedSongsState(): Song[] {
	const selectedSongs = useAtomValue(selectedSongsAtom);
	return selectedSongs;
}

/**
 * Hook to update selected songs state.
 *
 * Updates the list of selected songs in the visible table.
 * Used by table selection handlers to keep selection state
 * synchronized.
 *
 * @returns Selection update function
 */
export function useSetSelectedSongsState(): (songs: Song[]) => void {
	const setSelectedSongs = useSetAtom(selectedSongsAtom);

	return useCallback(
		(songs: Song[]) => {
			setSelectedSongs(songs);
		},
		[setSelectedSongs],
	);
}
