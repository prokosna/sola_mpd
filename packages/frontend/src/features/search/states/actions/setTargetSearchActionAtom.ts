import type { Search } from "@sola_mpd/shared/src/models/search_pb.js";
import { atom } from "jotai";

import { targetSearchAtom } from "../atoms/searchSongsAtom";

export const setTargetSearchActionAtom = atom(
	null,
	(_get, set, search: Search | undefined) => {
		set(targetSearchAtom, search);
	},
);
