import { DB_FILE_PLUGIN_STATE } from "@sola_mpd/domain/src/const/database.js";
import { PluginState } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";

import { FileRepository } from "./FileRepository.js";

export const pluginStateRepository = new FileRepository<PluginState>(
	DB_FILE_PLUGIN_STATE,
	new PluginState({
		plugins: [],
	}),
);
