import { clone } from "@bufbuild/protobuf";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import {
	type SongTableColumn,
	type SongTableState,
	SongTableStateSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";
import type { GridApi, IRowNode } from "ag-grid-community";

import type { SongsInTable } from "../types/songTableTypes";
import { copySortingAttributesToNewColumns } from "./songTableColumn";
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

export function createNewSongTableStateFromColumns(
	columns: SongTableColumn[],
	baseSongTableState: SongTableState,
	isSortingEnabled: boolean,
): SongTableState {
	const newState = clone(SongTableStateSchema, baseSongTableState);
	if (isSortingEnabled) {
		newState.columns = columns;
	} else {
		newState.columns = copySortingAttributesToNewColumns(
			columns,
			baseSongTableState.columns,
		);
	}
	return newState;
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
