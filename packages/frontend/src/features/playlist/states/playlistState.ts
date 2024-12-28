import { Playlist } from "@sola_mpd/domain/src/models/playlist_pb.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { fetchPlaylists } from "../utils/playlistUtils";

const playlistsAtom = atomWithRefresh(async (get) => {
  const mpdClient = get(mpdClientAtom);
  const profile = await get(currentMpdProfileSyncAtom);

  if (profile === undefined) {
    return [];
  }

  const playlists = await fetchPlaylists(mpdClient, profile);
  return playlists.sort((a, b) => a.name.localeCompare(b.name));
});

const playlistsSyncAtom = atomWithSync(playlistsAtom);

export const selectedPlaylistAtom = atom<Playlist | undefined>(undefined);

/**
 * A hook that returns the current state of playlists.
 * @returns An array of Playlist objects representing the current playlists.
 */
export function usePlaylistsState() {
  return useAtomValue(playlistsSyncAtom);
}

/**
 * A hook that returns a function to refresh the playlists state.
 * This can be used to trigger a re-fetch of the playlists.
 * @returns A function that, when called, will refresh the playlists state.
 */
export function useRefreshPlaylistsState() {
  return useSetAtom(playlistsAtom);
}

/**
 * A hook that returns the currently selected playlist.
 * @returns The currently selected Playlist object, or undefined if no playlist is selected.
 */
export function useSelectedPlaylistState() {
  return useAtomValue(selectedPlaylistAtom);
}

/**
 * A hook that returns a function to set the selected playlist state.
 * @returns A function that takes a Playlist object (or undefined) and updates the selected playlist state.
 */
export function useSetSelectedPlaylistState() {
  return useSetAtom(selectedPlaylistAtom);
}
