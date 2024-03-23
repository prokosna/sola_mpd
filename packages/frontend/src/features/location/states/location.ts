import { atom, useAtomValue } from "jotai";

const pathnameAtom = atom("");

export { pathnameAtom };

export function usePathname() {
  return useAtomValue(pathnameAtom);
}
