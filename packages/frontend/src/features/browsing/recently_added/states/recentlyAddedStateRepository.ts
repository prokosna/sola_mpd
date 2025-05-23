import { atomWithDefault } from "jotai/utils";

import type { RecentlyAddedStateRepository } from "../services/RecentlyAddedStateRepository";

export const recentlyAddedStateRepositoryAtom =
	atomWithDefault<RecentlyAddedStateRepository>(() => {
		throw new Error("Not initialized. Should be setup DI in the provider.");
	});
