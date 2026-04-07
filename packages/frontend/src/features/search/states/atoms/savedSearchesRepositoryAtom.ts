import { createStateRepositoryAtom } from "../../../common/states/atoms/stateRepositoryAtom";
import type { SavedSearchesRepository } from "../../repositories/SavedSearchesRepository";

export const savedSearchesRepositoryAtom =
	createStateRepositoryAtom<SavedSearchesRepository>();
