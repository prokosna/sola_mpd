import { useToast } from "@chakra-ui/react";
import { produce } from "immer";
import { useCallback } from "react";

import { useSocket } from "../../global/hooks/useSocket";
import { useAppStore } from "../../global/store/AppStore";

import { usePluginState } from "./usePluginState";

import { Plugin } from "@/models/plugin/plugin";

export function usePluginListLogic() {
  const socket = useSocket();
  const pluginState = usePluginState();
  const updatePluginState = useAppStore((state) => state.updatePluginState);
  const toast = useToast();

  const removePlugin = useCallback(
    (plugin: Plugin) => {
      if (pluginState === undefined || socket === undefined) {
        return;
      }
      const index = pluginState.plugins.findIndex(
        (v) => `${v.host}:${v.port}` === `${plugin.host}:${plugin.port}`
      );
      if (index < 0) {
        return;
      }
      const newPluginState = produce(pluginState, (draft) => {
        draft.plugins.splice(index, 1);
      });
      updatePluginState(socket, newPluginState);
      toast({
        status: "success",
        title: "Plugin removed",
        description: `Plugin ${plugin.info?.name} has been removed.`,
      });
    },
    [pluginState, socket, toast, updatePluginState]
  );

  return {
    plugins: pluginState?.plugins || [],
    removePlugin,
  };
}
