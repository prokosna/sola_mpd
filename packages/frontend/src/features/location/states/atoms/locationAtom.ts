import { atom } from "jotai";

export const pathnameAtom = atom("");

// The URL's query string (`location.search`, including the leading "?").
// Exists so atoms can reactively derive from search params without calling
// React Router hooks directly, which is not possible from inside a Jotai
// atom. Kept in sync by LocationObserver, mirroring pathnameAtom.
export const searchParamsAtom = atom("");

export const transitionCounterAtom = atom(0);
