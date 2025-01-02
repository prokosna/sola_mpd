import type { Atom } from "jotai";
import { unwrap } from "jotai/utils";

export function atomWithSync<T>(baseAtom: Atom<Promise<T> | T>) {
	return unwrap(baseAtom, (prev) => prev || undefined);
}
