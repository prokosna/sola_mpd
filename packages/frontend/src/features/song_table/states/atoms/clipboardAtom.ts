import { atomWithDefault } from "jotai/utils";

import type { Clipboard } from "../../services/Clipboard";

export const clipboardAtom = atomWithDefault<Clipboard>(() => {
	throw new Error("Not initialized. Should be setup DI in the provider.");
});
