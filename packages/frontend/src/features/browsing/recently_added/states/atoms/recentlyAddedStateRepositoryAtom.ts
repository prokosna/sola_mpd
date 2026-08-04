import { createStateRepositoryAtom } from "../../../../common";
import type { RecentlyAddedStateRepository } from "../../repositories/RecentlyAddedStateRepository";

export const recentlyAddedStateRepositoryAtom =
	createStateRepositoryAtom<RecentlyAddedStateRepository>();
