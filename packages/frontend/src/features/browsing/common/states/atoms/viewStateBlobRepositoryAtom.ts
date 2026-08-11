import { createStateRepositoryAtom } from "../../../../common";
import type { ViewStateBlobRepository } from "../../repositories/ViewStateBlobRepository";

export const viewStateBlobRepositoryAtom =
	createStateRepositoryAtom<ViewStateBlobRepository>();
