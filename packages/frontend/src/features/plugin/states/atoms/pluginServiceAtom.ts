import { atomWithDefault } from "jotai/utils";

import type { PluginService } from "../../services/PluginService";

export const pluginServiceAtom = atomWithDefault<PluginService>(() => {
	throw new Error("Not initialized. Should be setup DI in the provider.");
});
