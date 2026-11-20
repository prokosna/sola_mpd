import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import type { GridApi, IRowNode } from "ag-grid-community";

import type { SongsInTable } from "../types/songTableTypes";
import { convertNodeToSong } from "./songTableKey";

export function getSongsInTableFromGrid(
	clickedSongKey: string | undefined,
	gridApi: GridApi,
	songsMap: Map<string, Song>,
): SongsInTable {
	const nodes: IRowNode[] = [];
	let clickedNode: IRowNode | undefined;
	gridApi.forEachNodeAfterFilterAndSort((node) => {
		nodes.push(node);
		if (clickedSongKey !== undefined && node.data?.key === clickedSongKey) {
			clickedNode = node;
		}
	});

	const clickedSong =
		clickedNode !== undefined
			? convertNodeToSong(songsMap, clickedNode)
			: undefined;
	const sortedSongs: Song[] = [];
	const selectedSortedSongs: Song[] = [];
	for (const node of nodes) {
		const song = convertNodeToSong(songsMap, node);
		if (song !== undefined) {
			sortedSongs.push(song);
			if (node.isSelected()) {
				selectedSortedSongs.push(song);
			}
		}
	}

	return {
		clickedSong,
		sortedSongs,
		selectedSortedSongs,
	};
}

export function getSelectedSongsInTableFromGrid(
	gridApi: GridApi,
	songsMap: Map<string, Song>,
): Song[] {
	const selectedNodes = gridApi
		.getSelectedNodes()
		.filter((node) => node.rowIndex !== null)
		.sort((a, b) => (a.rowIndex ?? 0) - (b.rowIndex ?? 0));
	const selectedSortedSongs: Song[] = [];
	for (const node of selectedNodes) {
		const song = convertNodeToSong(songsMap, node);
		if (song !== undefined) {
			selectedSortedSongs.push(song);
		}
	}
	return selectedSortedSongs;
}

export function getTableIndexOfSong(
	songKey: string,
	gridApi: GridApi,
): number | undefined {
	let index: number | undefined;
	gridApi.forEachNodeAfterFilterAndSort((node) => {
		if (node.data?.key === songKey && node.rowIndex !== null) {
			index = node.rowIndex;
		}
	});
	return index;
}
