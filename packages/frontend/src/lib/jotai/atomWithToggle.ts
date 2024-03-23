import { atom } from "jotai";

export function atomWithToggle(initialValue: boolean) {
  const anAtom = atom(
    (_get) => initialValue,
    (get, set, nextValue) => {
      const update = nextValue ?? !get(anAtom);
      set(anAtom, update);
    },
  );
  return anAtom;
}
