import { atom, useAtomValue, useSetAtom } from "jotai";

/**
 * Stores the current pathname from react-router.
 *
 * Acts as the source of truth for the current route in the application,
 * updated by LocationObserver on route changes. Components can subscribe
 * to this atom to react to navigation events.
 */
export const pathnameAtom = atom("");

/**
 * Provides read-only access to the current pathname.
 *
 * Automatically updates when the route changes via LocationObserver.
 * Useful for components that need to render different content based
 * on the current route.
 *
 * @returns Current pathname string
 */
export function usePathname() {
  return useAtomValue(pathnameAtom);
}

/**
 * Provides a function to update the pathname atom.
 *
 * Primarily used by LocationObserver, but can be used by any component
 * that needs to track the current route. Note that this does not
 * navigate - use react-router hooks for actual navigation.
 *
 * @returns Pathname setter function
 */
export function useSetPathname() {
  return useSetAtom(pathnameAtom);
}
