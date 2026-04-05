import { atomWithDefault } from "jotai/utils";

import type { BrowserStateRepository } from "../../services/BrowserStateRepository";

export const browserStateRepositoryAtom =
	atomWithDefault<BrowserStateRepository>(() => {
		throw new Error("Not initialized. Should be setup DI in the provider.");
	});
