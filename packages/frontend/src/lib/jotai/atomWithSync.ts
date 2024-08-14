import { Atom, atom } from "jotai";
import { unwrap } from "jotai/utils";

export function atomWithSync<T>(
  baseAtom: Atom<Promise<T>>,
): Atom<T | Promise<T>> {
  const unwrappedAtom = unwrap(baseAtom, (prev) => prev);
  return atom((get) => get(unwrappedAtom) ?? get(baseAtom));
}
