import { createStateRepositoryAtom } from "../../../../common/states/atoms/stateRepositoryAtom";
import type { RecentlyAddedStateRepository } from "../../repositories/RecentlyAddedStateRepository";

export const recentlyAddedStateRepositoryAtom =
	createStateRepositoryAtom<RecentlyAddedStateRepository>();
