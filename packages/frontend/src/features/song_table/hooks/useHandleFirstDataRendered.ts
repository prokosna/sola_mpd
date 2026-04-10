import type { FirstDataRenderedEvent } from "ag-grid-community";
import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { currentSongAtom } from "../../player";
import { getSongTableKey } from "../functions/songTableKey";
import { getTableIndexOfSong } from "../functions/songTableState";
import type { SongTableKeyType } from "../types/songTableTypes";

export function useHandleFirstDataRendered(
	keyType: SongTableKeyType,
	scrollToPlayingSong: boolean,
): (event: FirstDataRenderedEvent) => void {
	const currentSong = useAtomValue(currentSongAtom);

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
