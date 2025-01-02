import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { AgGridReact } from "ag-grid-react";
import { MutableRefObject, RefObject } from "react";

import { useInputKeyCombination } from "../../keyboard_shortcut";
import { SongTableKey } from "../types/songTableTypes";
import { convertNodeToSong } from "../utils/songTableTableUtils";

/**
 * Sets up Ctrl+A keyboard shortcut for song selection.
 *
 * Binds the shortcut to a component, allowing users to select
 * all visible songs in the grid. Handles grid state and song
 * list synchronization.
 *
 * @param ref Target component ref
 * @param gridRef AG Grid instance ref
 * @param songsMap Song lookup map
 * @param selectSongs Selection callback
 */
export function useKeyboardShortcutSelectAll(
  ref: MutableRefObject<null>,
  gridRef: RefObject<AgGridReact>,
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

    api.selectAllFiltered();
    selectSongs(selectedSongs);
  });
}
