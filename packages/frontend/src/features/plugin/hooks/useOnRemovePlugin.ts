import { useToast } from "@chakra-ui/react";
import { Plugin } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { useCallback } from "react";

import { usePluginState, useSetPluginState } from "../states/persistent";

export function useOnRemovePlugin(plugin: Plugin) {
  const toast = useToast();
  const pluginState = usePluginState();
  const setPluginState = useSetPluginState();

  const onRemovePlugin = useCallback(() => {
    if (pluginState === undefined) {
      return;
    }
    const index = pluginState.plugins.findIndex(
      (v) => `${v.host}:${v.port}` === `${plugin.host}:${plugin.port}`,
    );
    if (index < 0) {
      return;
    }
    const newState = pluginState.clone();
    newState.plugins.splice(index, 1);
    setPluginState(newState);
    toast({
      status: "success",
      title: "Plugin successfully removed",
      description: `Plugin ${plugin.info?.name} has been removed.`,
    });
  }, [plugin, pluginState, toast, setPluginState]);

  return onRemovePlugin;
}
