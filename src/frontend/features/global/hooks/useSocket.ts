import { useEffect } from "react";

import { useAppStore } from "../store/AppStore";

export function useSocket() {
  const socket = useAppStore((state) => state.socket);
  const refreshWebSocket = useAppStore((state) => state.refreshWebSocket);
  const profileState = useAppStore((state) => state.profileState);
  const pullProfileState = useAppStore((state) => state.pullProfileState);

  useEffect(() => {
    if (profileState?.currentProfile === undefined) {
      pullProfileState();
      return;
    }
    if (socket === undefined) {
      refreshWebSocket(profileState.currentProfile);
      return;
    }
  }, [
    profileState?.currentProfile,
    pullProfileState,
    refreshWebSocket,
    socket,
  ]);

  return socket;
}
