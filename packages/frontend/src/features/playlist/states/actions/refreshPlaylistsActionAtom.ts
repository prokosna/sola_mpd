import { atom } from "jotai";

import { playlistsAsyncAtom } from "../atoms/playlistAtom";

export const refreshPlaylistsActionAtom = atom(null, (_get, set) => {
	set(playlistsAsyncAtom);
});
