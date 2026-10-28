import { atom } from "jotai";

import { convertGlobalFilterTextToTokens } from "../../functions/globalFilterFiltering";

export const globalFilterTextAtom = atom("");

export const globalFilterTokensAtom = atom((get) =>
	convertGlobalFilterTextToTokens(get(globalFilterTextAtom)),
);
