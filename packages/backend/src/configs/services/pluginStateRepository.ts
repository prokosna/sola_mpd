import { create } from "@bufbuild/protobuf";
import { DB_FILE_PLUGIN_STATE } from "@sola_mpd/shared/src/const/database.js";
import {
	type PluginState,
	PluginStateSchema,
} from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";

import { ConfigRepositoryFile } from "./ConfigRepositoryFile.js";

export const pluginStateRepository = new ConfigRepositoryFile<PluginState>(
	DB_FILE_PLUGIN_STATE,
	PluginStateSchema,
	create(PluginStateSchema, {
		plugins: [],
	}),
);
