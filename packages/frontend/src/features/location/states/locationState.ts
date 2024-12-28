import { atom, useAtomValue, useSetAtom } from "jotai";

export const pathnameAtom = atom("");

/**
 * A custom hook that returns the current pathname from the pathnameAtom.
 * @returns The current pathname.
 */
export function usePathname() {
  return useAtomValue(pathnameAtom);
}

/**
 * A custom hook that returns a function to update the pathname.
 * @returns A function that sets the new pathname.
 */
export function useSetPathname() {
  return useSetAtom(pathnameAtom);
}
