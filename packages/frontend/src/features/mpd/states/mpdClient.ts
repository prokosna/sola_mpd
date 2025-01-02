import { useAtomValue } from "jotai";
import { atomWithDefault } from "jotai/utils";

import { MpdClient } from "../services/MpdClient";

/**
 * Provides access to the shared MPD client instance.
 *
 * Must be initialized by a provider component with proper configuration.
 * Used across the application for consistent MPD communication.
 *
 * @throws Error if accessed before initialization
 */
export const mpdClientAtom = atomWithDefault<MpdClient>(() => {
  throw new Error("Not initialized. Should be setup DI in the provider.");
});

/**
 * Hook for accessing the MPD client instance.
 *
 * Used by components that need to interact with MPD directly,
 * such as playback controls or queue management. The client
 * instance must be initialized before using this hook.
 *
 * @returns The current MPD client instance
 * @throws Error if client not initialized
 */
export function useMpdClientState() {
  return useAtomValue(mpdClientAtom);
}
