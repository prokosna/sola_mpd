import { atom, useAtomValue, useSetAtom } from "jotai";

/**
 * Stores the current pathname from react-router.
 *
 * Acts as the source of truth for the current route in the application,
 * updated by LocationObserver on route changes. Components can subscribe
 * to this atom to react to navigation events.
 */
export const pathnameAtom = atom("");

const transitionCounterAtom = atom(0);
const transitionCounterReadWriteAtom = atom(
	(get) => get(transitionCounterAtom),
	(get, set) => {
		set(transitionCounterAtom, get(transitionCounterAtom) + 1);
	},
);

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

/**
 * Hook to access the current transition counter value.
 *
 * This is used to detect page transition clicks even without actual page transitions
 * (like clicking on a link to the current page).
 *
 * @returns The current transition counter value
 */
export function useTransitionCounter() {
	return useAtomValue(transitionCounterReadWriteAtom);
}

/**
 * Hook to provide a function that increments the transition counter.
 *
 * This is useful for triggering effects or re-renders when a transition
 * occurs, even if the actual route doesn't change. It's particularly
 * helpful for handling cases where a user clicks a link to the current page.
 *
 * @returns A function that, when called, increments the transition counter
 */
export function useIncrementTransitionCounter() {
	return useSetAtom(transitionCounterReadWriteAtom);
}
