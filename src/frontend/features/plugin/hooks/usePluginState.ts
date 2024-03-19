import { useEffect } from "react";

import { useSocket } from "../../global/hooks/useSocket";
import { useAppStore } from "../../global/store/AppStore";

export function usePluginState() {
  const socket = useSocket();
  const pluginState = useAppStore((state) => state.pluginState);
  const pullPluginState = useAppStore((state) => state.pullPluginState);

  useEffect(() => {
    if (socket !== undefined && pluginState === undefined) {
      pullPluginState(socket);
      return;
    }
  }, [pluginState, pullPluginState, socket]);

  return pluginState;
}
