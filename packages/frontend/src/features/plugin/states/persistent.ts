import {
  PluginRegisterRequest,
  PluginState,
} from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { unwrap } from "jotai/utils";
import { useCallback } from "react";

import { atomWithRefresh } from "../../../lib/jotai/atomWithRefresh";
import { socketAtom } from "../../socketio/states/socketio";
import { fetchPluginState, sendPluginState } from "../helpers/api";
import { registerPlugin } from "../helpers/socket";

const pluginStateAtom = atomWithRefresh(async (get) => {
  const pluginState = await fetchPluginState();

  // Fetch the latest plugin info
  const socket = await get(socketAtom);
  const plugins = pluginState.plugins;

  const newPlugins = await Promise.all(
    plugins.map(async (plugin) => {
      const newPlugin = plugin.clone();
      newPlugin.isAvailable = false;

      const req = new PluginRegisterRequest({
        host: plugin.host,
        port: plugin.port,
      });

      try {
        const resp = await registerPlugin(socket, req);
        if (resp.info !== undefined) {
          newPlugin.info = resp.info;
          newPlugin.isAvailable = true;
        }
      } catch (e) {
        console.error(e);
      }
      return newPlugin;
    }),
  );

  return new PluginState({
    plugins: newPlugins,
  });
});

const unwrappedPluginStateAtom = unwrap(
  pluginStateAtom,
  (prev) => prev || undefined,
);

export function usePluginState() {
  return useAtomValue(unwrappedPluginStateAtom);
}

export function useRefreshPluginState() {
  return useSetAtom(pluginStateAtom);
}

export function useSetPluginState() {
  const refresh = useSetAtom(pluginStateAtom);

  return useCallback(
    async (pluginState: PluginState) => {
      await sendPluginState(pluginState);
      refresh();
    },
    [refresh],
  );
}
