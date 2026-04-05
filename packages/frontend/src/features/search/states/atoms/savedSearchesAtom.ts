import type { SavedSearches } from "@sola_mpd/shared/src/models/search_pb.js";
import { atomWithDefault } from "jotai/utils";

import { atomWithSync } from "../../../../lib/jotai/atomWithSync";

import { savedSearchesRepositoryAtom } from "./savedSearchesRepositoryAtom";

export const savedSearchesAsyncAtom = atomWithDefault<
	Promise<SavedSearches> | SavedSearches
>(async (get) => {
	const repository = get(savedSearchesRepositoryAtom);
	return await repository.fetch();
});

export const savedSearchesAtom = atomWithSync(savedSearchesAsyncAtom);
