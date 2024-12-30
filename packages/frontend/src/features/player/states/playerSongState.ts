import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh, selectAtom } from "jotai/utils";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { fetchCurrentSong } from "../utils/playerUtils";

const currentSongAtom = atomWithRefresh(async (get) => {
  const mpdClient = get(mpdClientAtom);
  const profile = get(currentMpdProfileSyncAtom);

  if (profile === undefined) {
    return undefined;
  }

  return await fetchCurrentSong(mpdClient, profile);
});

const currentSongSyncAtom = atomWithSync(currentSongAtom);

const currentSongSyncWithCompareAtom = selectAtom<
  Song | undefined,
  Song | undefined
>(
  currentSongSyncAtom,
  (state, _prev) => state,
  (a, b) => a?.path === b?.path,
);

/**
 * Custom hook to access the current song state.
 * This hook ensures that the current song state is updated and compared efficiently.
 * @returns The current Song object or undefined if no song is playing.
 */
export function useCurrentSongState() {
  return useAtomValue(currentSongSyncWithCompareAtom);
}

/**
 * Returns a function to refresh the current song state.
 * This hook can be used to trigger a re-fetch of the current song.
 * @returns A function that, when called, will refresh the current song state.
 */
export function useRefreshCurrentSongState() {
  return useSetAtom(currentSongAtom);
}
