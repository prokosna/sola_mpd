import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import type { AgGridReact } from "ag-grid-react";
import type { RefObject } from "react";

import { useInputKeyCombination } from "../../keyboard_shortcut";
import { convertNodeToSong } from "../functions/songTableKey";
import type { SongTableKey } from "../types/songTableTypes";

export function useKeyboardShortcutSelectAll(
	ref: RefObject<HTMLDivElement | null>,
	gridRef: RefObject<AgGridReact | null>,
	songsMap: Map<SongTableKey, Song>,
	selectSongs: (songs: Song[]) => void,
): void {
	useInputKeyCombination(ref, ["Control", "a"], async () => {
		const api = gridRef.current?.api;
		if (api === undefined) {
			console.warn("AgGrid grid api is still undefined.");
			return;
		}

		const selectedSongs: Song[] = [];
		api.forEachNodeAfterFilterAndSort((node) => {
			const song = convertNodeToSong(songsMap, node);
			selectedSongs.push(song);
		});

		api.selectAll("filtered");
		selectSongs(selectedSongs);
	});
}
