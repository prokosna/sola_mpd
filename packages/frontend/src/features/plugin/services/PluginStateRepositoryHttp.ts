import { fromBinary, toBinary } from "@bufbuild/protobuf";
import { API_CONFIGS_PLUGIN_STATE } from "@sola_mpd/shared/src/const/api.js";
import {
	type PluginState,
	PluginStateSchema,
} from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { HttpClient } from "../../../lib/http/HttpClient";
import type { PluginStateRepository } from "./PluginStateRepository";

export class PluginStateRepositoryHttp implements PluginStateRepository {
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
