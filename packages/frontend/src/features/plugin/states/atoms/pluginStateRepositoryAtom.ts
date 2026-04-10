import { createStateRepositoryAtom } from "../../../common/states/atoms/stateRepositoryAtom";
import type { PluginStateRepository } from "../../repositories/PluginStateRepository";

export const pluginStateRepositoryAtom =
	createStateRepositoryAtom<PluginStateRepository>();
