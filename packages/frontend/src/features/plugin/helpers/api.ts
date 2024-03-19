import { API_CONFIGS_PLUGIN_STATE } from "@sola_mpd/domain/src/const/api.js";
import { PluginState } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";

import { HttpApiClient } from "../../http_api";

export async function fetchPluginState() {
  return HttpApiClient.get<PluginState>(
    API_CONFIGS_PLUGIN_STATE,
    PluginState.fromBinary,
  );
}

export async function sendPluginState(pluginState: PluginState) {
  return HttpApiClient.post(API_CONFIGS_PLUGIN_STATE, pluginState.toBinary());
}
