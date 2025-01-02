import { useAtomValue } from "jotai";
import { atomWithDefault } from "jotai/utils";

import { PluginService } from "../services/PluginService";

export const pluginServiceAtom = atomWithDefault<PluginService>(() => {
  throw new Error("Not initialized. Should be setup DI in the provider.");
});

/**
 * Get plugin service.
 *
 * @returns Service instance
 */
export function usePluginService(): PluginService {
  return useAtomValue(pluginServiceAtom);
}
