import { atomWithDefault } from "jotai/utils";

import type { MpdListener } from "../../services/MpdListener";

export const mpdListenerAtom = atomWithDefault<MpdListener>(() => {
	throw new Error("Not initialized. Should be setup DI in the provider.");
});
