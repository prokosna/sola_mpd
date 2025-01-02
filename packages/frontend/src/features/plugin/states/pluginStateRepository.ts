import { atomWithDefault } from "jotai/utils";

import type { PluginStateRepository } from "../services/PluginStateRepository";

export const pluginStateRepositoryAtom = atomWithDefault<PluginStateRepository>(
	() => {
		throw new Error("Not initialized. Should be setup DI in the provider.");
	},
);
