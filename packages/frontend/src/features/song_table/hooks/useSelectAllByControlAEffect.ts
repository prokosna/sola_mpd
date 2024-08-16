import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { AgGridReact } from "ag-grid-react";
import { MutableRefObject, RefObject } from "react";

import { useInputKeyCombination } from "../../keyboard_shortcut";
import { convertNodeToSong } from "../workflows/convertAgGridTableSongs";

export function useSelectAllByControlAEffect(
  parentDivRef: MutableRefObject<null>,
  gridRef: RefObject<AgGridReact>,
  songsMap: Map<string, Song>,
  updateSelectedSongsAction: (newSelectedSongs: Song[]) => Promise<void>,
) {
  useInputKeyCombination(parentDivRef, ["Control", "a"], async () => {
    const api = gridRef.current?.api;
    if (api === undefined) {
      console.warn("api undefined");
      return;
    }

    const selectedSongs: Song[] = [];
    api.forEachNodeAfterFilterAndSort((node) => {
      const song = convertNodeToSong(songsMap, node);
      if (song === undefined) {
        return;
      }
      selectedSongs.push(song);
    });
    api.selectAllFiltered();
    updateSelectedSongsAction(selectedSongs);
  });
}
