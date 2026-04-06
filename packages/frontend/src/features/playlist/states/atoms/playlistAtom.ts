import type { Playlist } from "@sola_mpd/shared/src/models/playlist_pb.js";
import { atom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import { mpdClientAtom } from "../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileAtom } from "../../../profile/states/atoms/mpdProfileAtom";
import { localeCollatorAtom } from "../../../settings/states/atoms/localeAtom";
import { fetchPlaylists } from "../../functions/playlistOperations";

export const playlistsAsyncAtom = atomWithRefresh(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);
	const collator = get(localeCollatorAtom);

	if (profile === undefined) {
		return [];
	}

	const playlists = await fetchPlaylists(mpdClient, profile);
	return playlists.sort((a, b) => collator.compare(a.name, b.name));
});

export const playlistsAtom = atomWithSync(playlistsAsyncAtom);

export const selectedPlaylistAtom = atom<Playlist | undefined>(undefined);
