import { atomWithDefault } from "jotai/utils";

import type { BrowserStateRepository } from "../services/BrowserStateRepository";

/**
 * Atom for browser state repository dependency injection.
 *
 * Features:
 * - Provider-based initialization
 * - Error handling for missing setup
 * - Repository interface enforcement
 */
export const browserStateRepositoryAtom =
	atomWithDefault<BrowserStateRepository>(() => {
		throw new Error("Not initialized. Should be setup DI in the provider.");
	});
