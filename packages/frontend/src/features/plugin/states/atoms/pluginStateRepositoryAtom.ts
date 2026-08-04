import { createStateRepositoryAtom } from "../../../common";
import type { PluginStateRepository } from "../../repositories/PluginStateRepository";

export const pluginStateRepositoryAtom =
	createStateRepositoryAtom<PluginStateRepository>();
