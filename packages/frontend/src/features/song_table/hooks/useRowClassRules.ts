import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import type { RowClassRules } from "ag-grid-community";
import { useMemo } from "react";

import { useCurrentSongState } from "../../player";
import type {
	SongTableKey,
	SongTableKeyType,
	SongTableRowData,
} from "../types/songTableTypes";
import { getSongTableKey } from "../utils/songTableTableUtils";

/**
 * Creates row class rules for highlighting currently playing song.
 * Applies 'ag-font-weight-bold' class to the row
 * containing the currently playing song. Uses song key matching
 * for identification.
 *
 * @param keyType Song key type
 * @param songsMap Song lookup map
 * @returns Row class rules object
 */
export function useRowClassRules(
	keyType: SongTableKeyType,
	songsMap: Map<SongTableKey, Song>,
): RowClassRules<SongTableRowData> {
	const currentSong = useCurrentSongState();

	return useMemo(() => {
		const currentSongKey = currentSong
			? getSongTableKey(currentSong, keyType)
			: undefined;

		return {
			"ag-font-weight-bold": (params) => {
				if (params.data === undefined || currentSongKey === undefined) {
					return false;
				}

				const targetKey = params.data.key;
				if (targetKey === undefined) {
					return false;
				}

				const targetSong = songsMap.get(String(targetKey));
				if (targetSong === undefined) {
					return false;
				}

				const rowKey = getSongTableKey(targetSong, keyType);
				return rowKey === currentSongKey;
			},
		};
	}, [currentSong, keyType, songsMap]);
}
