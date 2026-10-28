import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import type { AgGridReact } from "ag-grid-react";
import { type RefObject, useEffect } from "react";

import { convertSongsToTsv } from "../functions/songTableClipboard";
import { convertAgGridColumnsToSongTableColumnViews } from "../functions/songTableColumn";
import { convertNodeToSong } from "../functions/songTableKey";
import { getSongsInTableFromGrid } from "../functions/songTableState";
import type {
	SongTableColumnView,
	SongTableKey,
} from "../types/songTableTypes";

// Only text picked out inside one cell is left to the browser's own copy. A
// selection spanning cells comes from dragging or Shift+clicking across rows,
// where the user means the rows, so it is copied as TSV like any row selection.
function isTextSelectedWithinSingleCell(selection: Selection | null): boolean {
	if (selection === null || selection.isCollapsed) {
		return false;
	}
	const findCell = (node: Node | null) =>
		(node instanceof Element ? node : node?.parentElement)?.closest(
			".ag-cell",
		) ?? undefined;
	const anchorCell = findCell(selection.anchorNode);
	return (
		anchorCell !== undefined && anchorCell === findCell(selection.focusNode)
	);
}

export function useKeyboardShortcutCopy(
	ref: RefObject<HTMLDivElement | null>,
	gridRef: RefObject<AgGridReact | null>,
	songsMap: Map<SongTableKey, Song>,
	columns: SongTableColumnView[],
): void {
	useEffect(() => {
		const onCopy = (event: ClipboardEvent) => {
			// A copy event targets the selection, not the focused element.
			if (!ref.current?.contains(document.activeElement)) {
				return;
			}
			if (isTextSelectedWithinSingleCell(document.getSelection())) {
				return;
			}
			const api = gridRef.current?.api;
			if (api === undefined || event.clipboardData === null) {
				return;
			}

			let songs = getSongsInTableFromGrid(
				undefined,
				api,
				songsMap,
			).selectedSortedSongs;
			if (songs.length === 0) {
				const focusedCell = api.getFocusedCell();
				const node =
					focusedCell != null
						? api.getDisplayedRowAtIndex(focusedCell.rowIndex)
						: undefined;
				if (node?.data === undefined) {
					return;
				}
				songs = [convertNodeToSong(songsMap, node)];
			}

			const gridColumns = convertAgGridColumnsToSongTableColumnViews(
				api.getAllGridColumns(),
			);
			// The compact layout has a single combined column with no tag.
			const targetColumns = gridColumns.length > 0 ? gridColumns : columns;

			event.clipboardData.setData(
				"text/plain",
				convertSongsToTsv(songs, targetColumns),
			);
			event.preventDefault();
		};

		document.addEventListener("copy", onCopy);
		return () => {
			document.removeEventListener("copy", onCopy);
		};
	}, [ref, gridRef, songsMap, columns]);
}
