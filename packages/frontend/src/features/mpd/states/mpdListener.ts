import { useAtomValue } from "jotai";
import { atomWithDefault } from "jotai/utils";

import type { MpdListener } from "../services/MpdListener";

/**
 * Provides access to the shared MPD event listener instance.
 *
 * Must be initialized by a provider component with proper configuration.
 * Used across the application for consistent event handling and state
 * updates from the MPD server.
 *
 * @throws Error if accessed before initialization
 */
export const mpdListenerAtom = atomWithDefault<MpdListener>(() => {
	throw new Error("Not initialized. Should be setup DI in the provider.");
});

/**
 * Hook for accessing the MPD event listener instance.
 *
 * Used by components that need to react to MPD state changes,
 * such as playback state or queue updates. The listener
 * instance must be initialized before using this hook.
 *
 * @returns The current MPD event listener instance
 * @throws Error if listener not initialized
 */
export function useMpdListenerState() {
	return useAtomValue(mpdListenerAtom);
}
