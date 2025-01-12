import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import type { IRowNode, RowClassParams } from "ag-grid-community";
import type { AgGridReact } from "ag-grid-react";
import { type RefObject, useCallback, useEffect, useRef } from "react";

import { useCurrentSongState } from "../../player";
import type {
	SongTableKey,
	SongTableKeyType,
	SongTableRowData,
} from "../types/songTableTypes";
import { getSongTableKey } from "../utils/songTableTableUtils";

/**
 * Creates a callback for highlighting currently playing song.
 * Applies 'ag-font-weight-bold' class to the row
 * containing the currently playing song. Uses song key matching
 * for identification.
 *
 * @param gridRef Reference to the AG Grid component
 * @param keyType Song key type
 * @param songsMap Song lookup map
 * @returns Row class callback
 */
export function useGetBoldClassForPlayingSong(
	gridRef: RefObject<AgGridReact>,
	keyType: SongTableKeyType,
	songsMap: Map<SongTableKey, Song>,
): (params: RowClassParams<SongTableRowData>) => string | undefined {
	const currentSong = useCurrentSongState();

	const prevSongKeyRef = useRef<string | undefined>(undefined);

	const api = gridRef.current?.api;

	const currentSongKey = currentSong
		? getSongTableKey(currentSong, keyType)
		: undefined;

	// Need to refresh rows when a current song is changed.
	// For better performance, limit target songs to the previous and the current song.
	useEffect(() => {
		if (api === undefined) {
			return;
		}

		const rowsToRedraw: IRowNode<SongTableRowData>[] = [];

		// Previous playing song.
		if (prevSongKeyRef.current !== undefined) {
			api.forEachNode((node) => {
				if (node.data === undefined) {
					return;
				}
				const song = songsMap.get(node.data.key);
				if (song === undefined) {
					return;
				}
				const songKey = getSongTableKey(song, keyType);
				if (songKey === prevSongKeyRef.current) {
					rowsToRedraw.push(node);
				}
			});
		}

		// Skip current song because it seems Ag Grid can detect a row class change from none to bold.

		// Redraw target songs.
		if (rowsToRedraw.length > 0) {
			api.redrawRows({ rowNodes: rowsToRedraw });
		}

		prevSongKeyRef.current = currentSongKey;
	}, [api, currentSongKey, keyType, songsMap]);

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
