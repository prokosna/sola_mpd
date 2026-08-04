import { createStateRepositoryAtom } from "../../../../common";
import type { BrowserStateRepository } from "../../repositories/BrowserStateRepository";

export const browserStateRepositoryAtom =
	createStateRepositoryAtom<BrowserStateRepository>();
