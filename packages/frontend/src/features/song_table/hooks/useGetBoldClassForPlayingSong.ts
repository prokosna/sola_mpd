import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import type { RowClassParams } from "ag-grid-community";
import { useCallback, useMemo } from "react";

import { useCurrentSongState } from "../../player";
import type {
	SongTableKey,
	SongTableKeyType,
	SongTableRowData,
} from "../types/songTableTypes";
import { getSongTableKey } from "../utils/songTableTableUtils";

/**
 * Creates a callback for highlighting currently playing song.
 *
 * Returns a function that applies bold text styling to the row
 * containing the currently playing song. Uses song key matching
 * for identification.
 *
 * @param keyType Song key type
 * @param songsMap Song lookup map
 * @returns Row class callback
 */
export function useGetBoldClassForPlayingSong(
	keyType: SongTableKeyType,
	songsMap: Map<SongTableKey, Song>,
): (params: RowClassParams<SongTableRowData>) => string | undefined {
	const currentSong = useCurrentSongState();

	const currentSongKey = useMemo(() => {
		if (currentSong === undefined) {
			return undefined;
		}

		return getSongTableKey(currentSong, keyType);
	}, [currentSong, keyType]);

	return useCallback(
		(params: RowClassParams<SongTableRowData>) => {
			if (params.data === undefined) {
				return;
			}

			const targetKey = params.data.key;
			if (targetKey === undefined) {
				return;
			}

			const targetSong = songsMap.get(String(targetKey));
			if (targetSong === undefined) {
				return;
			}

			const rowKey = getSongTableKey(targetSong, keyType);
			if (rowKey === currentSongKey) {
				return "ag-font-weight-bold";
			}
			return;
		},
		[currentSongKey, keyType, songsMap],
	);
}
