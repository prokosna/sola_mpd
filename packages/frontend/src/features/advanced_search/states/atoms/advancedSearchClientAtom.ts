import { atomWithDefault } from "jotai/utils";

import type { AdvancedSearchClient } from "../../services/AdvancedSearchClient";

export const advancedSearchClientAtom = atomWithDefault<AdvancedSearchClient>(
	() => {
		throw new Error("Not initialized. Should be setup DI in the provider.");
	},
);
