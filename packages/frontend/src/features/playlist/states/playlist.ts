import { Playlist } from "@sola_mpd/domain/src/models/playlist_pb.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { unwrap } from "jotai/utils";

import { atomWithRefresh } from "../../../lib/jotai/atomWithRefresh";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileAtom } from "../../profile/states/mpdProfileState";
import { addPlaylist, fetchPlaylists } from "../helpers/api";

const playlistsAtom = atomWithRefresh(async (get) => {
  const mpdClient = await get(mpdClientAtom);
  const currentMpdProfile = await get(currentMpdProfileAtom);

  if (currentMpdProfile === undefined) {
    return [];
  }

  const playlists = await fetchPlaylists(mpdClient, currentMpdProfile);
  return playlists.sort((a, b) => a.name.localeCompare(b.name));
});

const unwrappedPlaylistsAtom = unwrap(
  playlistsAtom,
  (prev) => prev || undefined,
);

const selectedPlaylistAtom = atom<Playlist | undefined>(undefined);

const addPlaylistAtom = atom(null, async (get, _set, playlist: Playlist) => {
  const mpdClient = await get(mpdClientAtom);
  const currentMpdProfile = await get(currentMpdProfileAtom);

  if (currentMpdProfile === undefined) {
    throw new Error("No profile is selected.");
  }

  return await addPlaylist(mpdClient, currentMpdProfile, playlist);
});

export { selectedPlaylistAtom };

export function usePlaylistsState() {
  return useAtomValue(unwrappedPlaylistsAtom);
}

export function useRefreshPlaylistsState() {
  return useSetAtom(playlistsAtom);
}

export function useSelectedPlaylistState() {
  return useAtomValue(selectedPlaylistAtom);
}

export function useSetSelectedPlaylistState() {
  return useSetAtom(selectedPlaylistAtom);
}

export function useAddPlaylist() {
  return useSetAtom(addPlaylistAtom);
}
