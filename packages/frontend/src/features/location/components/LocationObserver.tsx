import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useSetSelectedSongsState } from "../../song_table";
import { pathnameAtom } from "../states/location";

export function LocationObserver() {
  const location = useLocation();
  const setPathname = useSetAtom(pathnameAtom);
  const setSelectedSongs = useSetSelectedSongsState();

  useEffect(() => {
    setPathname(location.pathname);

    // When user moves to a different page, selected songs should be reset.
    setSelectedSongs([]);
  }, [location.pathname, setPathname, setSelectedSongs]);

  return undefined;
}
