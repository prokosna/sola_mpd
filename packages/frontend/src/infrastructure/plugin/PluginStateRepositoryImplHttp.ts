import { API_CONFIGS_PLUGIN_STATE } from "@sola_mpd/domain/src/const/api.js";
import { PluginState } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";

import { PluginStateRepository } from "../../features/plugin";
import { HttpClient } from "../http/HttpClient";

/**
 * Implementation of PluginStateRepository using HttpClient.
 */
export class PluginStateRepositoryImplHttp implements PluginStateRepository {
  constructor(private readonly client: HttpClient) {}

  fetch = async (): Promise<PluginState> => {
    return this.client.get<PluginState>(
      API_CONFIGS_PLUGIN_STATE,
      PluginState.fromBinary,
    );
  };

  save = async (pluginState: PluginState): Promise<void> => {
    return this.client.post(API_CONFIGS_PLUGIN_STATE, pluginState.toBinary());
  };
}
