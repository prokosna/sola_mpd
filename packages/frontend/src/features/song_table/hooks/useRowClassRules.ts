import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import type { RowClassRules } from "ag-grid-community";
import { useAtomValue } from "jotai";
import { useMemo } from "react";

import { currentSongAtom } from "../../player";
import { getSongTableKey } from "../functions/songTableKey";
import type {
	SongTableKey,
	SongTableKeyType,
	SongTableRowData,
} from "../types/songTableTypes";

export function useRowClassRules(
	keyType: SongTableKeyType,
	songsMap: Map<SongTableKey, Song>,
): RowClassRules<SongTableRowData> {
	const currentSong = useAtomValue(currentSongAtom);

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
