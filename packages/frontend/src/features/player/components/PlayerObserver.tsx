import { useEffect, useRef } from "react";

import { useRefreshCurrentSongState } from "../states/playerSongState";
import { useRefreshPlayerStatusState } from "../states/playerStatusState";

/**
 * PlayerObserver component that periodically refreshes the current song and player status.
 * It sets up an interval to update these states every second.
 * @returns Returns null as this component doesn't render anything visible.
 */
export function PlayerObserver() {
  const refreshCurrentSong = useRefreshCurrentSongState();
  const refreshPlayerStatus = useRefreshPlayerStatusState();

  const intervalIdRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );

  useEffect(() => {
    if (intervalIdRef.current === undefined) {
      const id = setInterval(() => {
        refreshCurrentSong();
        refreshPlayerStatus();
      }, 1000);
      intervalIdRef.current = id;
    }

    return () => {
      if (intervalIdRef.current !== undefined) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = undefined;
      }
    };
  }, [refreshCurrentSong, refreshPlayerStatus]);

  return null;
}
