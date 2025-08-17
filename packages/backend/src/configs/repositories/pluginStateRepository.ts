import { create } from "@bufbuild/protobuf";
import { DB_FILE_PLUGIN_STATE } from "@sola_mpd/domain/src/const/database.js";
import {
	type PluginState,
	PluginStateSchema,
} from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";

import { FileRepository } from "./FileRepository.js";

export const pluginStateRepository = new FileRepository<PluginState>(
	DB_FILE_PLUGIN_STATE,
	PluginStateSchema,
	create(PluginStateSchema, {
		plugins: [],
	}),
);
