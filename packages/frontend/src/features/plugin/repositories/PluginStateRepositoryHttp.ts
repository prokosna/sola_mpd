import { API_CONFIGS_PLUGIN_STATE } from "@sola_mpd/shared/src/const/api.js";
import type { PluginState } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import { PluginStateSchema } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { HttpClient } from "../../../lib/http/HttpClient";
import { StateRepositoryHttp } from "../../common/repositories/StateRepositoryHttp";

export class PluginStateRepositoryHttp extends StateRepositoryHttp<PluginState> {
	constructor(client: HttpClient) {
		super(client, API_CONFIGS_PLUGIN_STATE, PluginStateSchema);
	}
}
