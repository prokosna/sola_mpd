import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { AgGridReact } from "ag-grid-react";
import { MutableRefObject, RefObject } from "react";

import { useInputKeyCombination } from "../../keyboard_shortcut";
import { SongTableKey } from "../types/songTableTypes";
import { convertNodeToSong } from "../utils/songTableTableUtils";

/**
 * Enables Select All keyboard shortcut on a given ref component.
 * @param ref Ref to a component to enable the shortcut.
 * @param gridRef GridRef to a song table contained by the component.
 * @param songsMap Songs map.
 * @param selectSongs Function to select songs.
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
