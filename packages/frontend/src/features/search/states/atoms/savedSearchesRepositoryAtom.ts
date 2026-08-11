import { createStateRepositoryAtom } from "../../../common";
import type { SavedSearchesRepository } from "../../repositories/SavedSearchesRepository";

export const savedSearchesRepositoryAtom =
	createStateRepositoryAtom<SavedSearchesRepository>();
