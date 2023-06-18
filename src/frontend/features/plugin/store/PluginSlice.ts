import { produce } from "immer";
import { Socket } from "socket.io-client";
import { StateCreator } from "zustand";

import { AllSlices } from "../../global/store/AppStore";

import { ENDPOINT_APP_PLUGIN_STATE } from "@/const";
import { PluginRegisterRequest, PluginState } from "@/models/plugin/plugin";
import { ApiUtils } from "@/utils/ApiUtils";
import { PluginUtils } from "@/utils/PluginUtils";

export type PluginSlice = {
  pluginState: PluginState | undefined;
  pullPluginState: (socket: Socket) => Promise<void>;
  updatePluginState: (
    socket: Socket,
    pluginState: PluginState
  ) => Promise<void>;
};

export const createPluginSlice: StateCreator<AllSlices, [], [], PluginSlice> = (
  set,
  get
) => ({
  pluginState: undefined,
  pullPluginState: async (socket: Socket) => {
    const pluginState = await ApiUtils.get<PluginState>(
      ENDPOINT_APP_PLUGIN_STATE,
      PluginState
    );

    // Check availability
    const newPlugins = await Promise.all(
      pluginState.plugins.map(async (p) => {
        try {
          const req = PluginRegisterRequest.create({
            host: p.host,
            port: p.port,
          });
          const resp = await PluginUtils.register(socket, req);
          if (p.info !== undefined && resp.info !== undefined) {
            p.info.version = resp.info.version;
          }
          p.isAvailable = true;
        } catch (_) {
          p.isAvailable = false;
        }
        return p;
      })
    );
    const newPluginState = await produce(pluginState, (draft) => {
      draft.plugins = newPlugins;
    });

    set({
      pluginState: newPluginState,
    });
  },
  updatePluginState: async (socket: Socket, pluginState: PluginState) => {
    if (get().pluginState === undefined) {
      await get().pullPluginState(socket);
    }

    await ApiUtils.post<PluginState>(
      ENDPOINT_APP_PLUGIN_STATE,
      PluginState,
      pluginState
    );

    set({
      pluginState,
    });
  },
});
