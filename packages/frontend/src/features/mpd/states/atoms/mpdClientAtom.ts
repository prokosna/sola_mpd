import { atomWithDefault } from "jotai/utils";

import type { MpdClient } from "../../services/MpdClient";

export const mpdClientAtom = atomWithDefault<MpdClient>(() => {
	throw new Error("Not initialized. Should be setup DI in the provider.");
});
