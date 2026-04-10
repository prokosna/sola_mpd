import type { Playlist } from "@sola_mpd/shared/src/models/playlist_pb.js";
import { atom } from "jotai";

import { selectedPlaylistAtom } from "../atoms/playlistAtom";

export const setSelectedPlaylistActionAtom = atom(
	null,
	(_get, set, playlist: Playlist | undefined) => {
		set(selectedPlaylistAtom, playlist);
	},
);
