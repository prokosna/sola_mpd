import type { SongTableState } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { atomWithDefault } from "jotai/utils";

import { atomWithSync } from "../../../../lib/jotai/atomWithSync";

import { songTableStateRepositoryAtom } from "./songTableStateRepositoryAtom";

export const songTableStateAsyncAtom = atomWithDefault<
	Promise<SongTableState> | SongTableState
>(async (get) => {
	const repository = get(songTableStateRepositoryAtom);
	return await repository.fetch();
});

// The server's raw view. Every UI consumer composes from this via
// songTableColumnViewAtom; this atom is exported only for the Raw Data
// editor, which has to show the genuine on-disk document, deprecated fields
// included.
export const songTableServerStateAtom = atomWithSync(songTableStateAsyncAtom);
