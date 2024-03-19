import { FileRepository } from "./FileRepository";

import { DB_FILE_PLUGIN_STATE } from "@/const";
import { PluginState } from "@/models/plugin/plugin";

export const pluginStateRepository = new FileRepository<PluginState>(
  DB_FILE_PLUGIN_STATE,
  PluginState.create({
    plugins: [],
  }),
  PluginState,
);
