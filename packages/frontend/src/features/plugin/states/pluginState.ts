import {
  PluginRegisterRequest,
  PluginState,
} from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { atomWithDefault, unwrap } from "jotai/utils";
import { useCallback } from "react";

import { pluginServiceAtom } from "./pluginService";
import { pluginStateRepositoryAtom } from "./pluginStateRepository";

const pluginStateAtom = atomWithDefault(async (get) => {
  const repository = get(pluginStateRepositoryAtom);
  const pluginState = await repository.fetch();
  const pluginService = get(pluginServiceAtom);

  // Fetch the latest plugin info
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
        const resp = await pluginService.register(req);
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

export function useSavePluginState() {
  const repository = useAtomValue(pluginStateRepositoryAtom);

  return useCallback(
    async (pluginState: PluginState) => {
      await repository.save(pluginState);
    },
    [repository],
  );
}
