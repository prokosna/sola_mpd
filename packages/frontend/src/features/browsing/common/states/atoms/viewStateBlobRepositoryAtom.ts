import { createStateRepositoryAtom } from "../../../../common/states/atoms/stateRepositoryAtom";
import type { ViewStateBlobRepository } from "../../repositories/ViewStateBlobRepository";

export const viewStateBlobRepositoryAtom =
	createStateRepositoryAtom<ViewStateBlobRepository>();
