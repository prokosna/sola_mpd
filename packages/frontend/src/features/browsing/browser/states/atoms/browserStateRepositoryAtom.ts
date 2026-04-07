import { createStateRepositoryAtom } from "../../../../common/states/atoms/stateRepositoryAtom";
import type { BrowserStateRepository } from "../../repositories/BrowserStateRepository";

export const browserStateRepositoryAtom =
	createStateRepositoryAtom<BrowserStateRepository>();
