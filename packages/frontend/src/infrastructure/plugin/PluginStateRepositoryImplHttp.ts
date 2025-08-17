import { fromBinary, toBinary } from "@bufbuild/protobuf";
import { API_CONFIGS_PLUGIN_STATE } from "@sola_mpd/domain/src/const/api.js";
import {
	type PluginState,
	PluginStateSchema,
} from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import type { PluginStateRepository } from "../../features/plugin";
import type { HttpClient } from "../http/HttpClient";

/**
 * Implementation of PluginStateRepository using HttpClient.
 */
export class PluginStateRepositoryImplHttp implements PluginStateRepository {
	constructor(private readonly client: HttpClient) {}

	fetch = async (): Promise<PluginState> => {
		return this.client.get<PluginState>(API_CONFIGS_PLUGIN_STATE, (bytes) =>
			fromBinary(PluginStateSchema, bytes),
		);
	};

	save = async (pluginState: PluginState): Promise<void> => {
		return this.client.post(
			API_CONFIGS_PLUGIN_STATE,
			toBinary(PluginStateSchema, pluginState),
		);
	};
}
