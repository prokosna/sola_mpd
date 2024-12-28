import {
  PluginRegisterRequest,
  PluginState,
} from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { atomWithDefault, useResetAtom } from "jotai/utils";
import { useCallback } from "react";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { UpdateMode } from "../../../types/stateTypes";

import { pluginServiceAtom } from "./pluginServiceState";
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

const pluginStateSyncAtom = atomWithSync(pluginStateAtom);

/**
 * A hook that returns the current plugin state.
 * @returns The current PluginState.
 */
export function usePluginState() {
  return useAtomValue(pluginStateSyncAtom);
}

/**
 * A hook that returns a function to refresh the plugin state.
 * This can be used to trigger a re-fetch of the plugins and their latest information.
 * @returns A function that, when called, will refresh the plugin state.
 */
export function useRefreshPluginState() {
  return useResetAtom(pluginStateAtom);
}

/**
 * Returns a function to update the plugin state.
 * @returns A function that updates the plugin state locally and/or persists it.
 */
export function useUpdatePluginState() {
  const setPluginState = useSetAtom(pluginStateAtom);
  const repository = useAtomValue(pluginStateRepositoryAtom);

  return useCallback(
    async (pluginState: PluginState, mode: UpdateMode) => {
      if (mode & UpdateMode.LOCAL_STATE) {
        setPluginState(Promise.resolve(pluginState));
      }
      if (mode & UpdateMode.PERSIST) {
        await repository.save(pluginState);
      }
    },
    [repository, setPluginState],
  );
}
