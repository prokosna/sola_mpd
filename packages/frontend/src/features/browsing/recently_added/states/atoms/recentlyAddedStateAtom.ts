import type { RecentlyAddedState } from "@sola_mpd/shared/src/models/recently_added_pb.js";
import { atomWithDefault } from "jotai/utils";

import { atomWithSync } from "../../../../../lib/jotai/atomWithSync";

import { recentlyAddedStateRepositoryAtom } from "./recentlyAddedStateRepositoryAtom";

export const recentlyAddedStateAsyncAtom = atomWithDefault<
	Promise<RecentlyAddedState> | RecentlyAddedState
>(async (get) => {
	const repository = get(recentlyAddedStateRepositoryAtom);
	return await repository.fetch();
});

export const recentlyAddedStateAtom = atomWithSync(recentlyAddedStateAsyncAtom);
