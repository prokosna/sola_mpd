import { atom } from "jotai";

import { playlistSongsAsyncAtom } from "../atoms/playlistSongsAtom";

export const refreshPlaylistSongsActionAtom = atom(null, (_get, set) => {
	set(playlistSongsAsyncAtom);
});
