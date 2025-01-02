import { atomWithDefault } from "jotai/utils";

import type { MpdProfileStateRepository } from "../services/MpdProfileStateRepository";

/**
 * Atom for MPD profile state repository.
 *
 * Must be initialized by DI provider.
 */
export const mpdProfileStateRepositoryAtom =
	atomWithDefault<MpdProfileStateRepository>(() => {
		throw new Error("Not initialized. Should be setup DI in the provider.");
	});
