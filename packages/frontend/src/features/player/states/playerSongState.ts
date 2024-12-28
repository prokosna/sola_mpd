import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh } from "jotai/utils";
import { atomEffect } from "jotai-effect";

import { atomWithCompare } from "../../../lib/jotai/atomWithCompare";
import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { fetchCurrentSong } from "../utils/playerUtils";

const currentSongAtom = atomWithRefresh(async (get) => {
  const mpdClient = get(mpdClientAtom);
  const profile = await get(currentMpdProfileSyncAtom);

  if (profile === undefined) {
    return undefined;
  }

  return await fetchCurrentSong(mpdClient, profile);
});

const currentSongSyncAtom = atomWithSync(currentSongAtom);

const setCurrentSongWithCompareEffectAtom = atomEffect((get, set) => {
  const currentSongPromise = get(currentSongSyncAtom);
  (async () => {
    const currentSong = await currentSongPromise;
    set(currentSongSyncWithCompareAtom, currentSong);
  })();
});

const currentSongSyncWithCompareAtom = atomWithCompare<Song | undefined>(
  undefined,
  (prev, next) => {
    return prev?.path === next?.path;
  },
);

/**
 * Custom hook to access the current song state.
 * This hook ensures that the current song state is updated and compared efficiently.
 * @returns The current Song object or undefined if no song is playing.
 */
export function useCurrentSongState() {
  useAtom(setCurrentSongWithCompareEffectAtom);
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
