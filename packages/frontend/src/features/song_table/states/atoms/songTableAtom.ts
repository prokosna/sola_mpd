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

export const songTableStateAtom = atomWithSync(songTableStateAsyncAtom);
