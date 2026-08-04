import { atom } from "jotai";

import { localeAtom } from "../atoms/localeAtom";

/**
 * Sets the locale used for language-aware sorting. The atom is backed by
 * atomWithStorage, so persistence to this device still happens inside it.
 */
export const setLocaleActionAtom = atom(null, (_get, set, locale: string) => {
	set(localeAtom, locale);
});
