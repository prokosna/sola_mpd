import { useEffect, useRef } from "react";

import { useRefreshCurrentSongState } from "../states/song";
import { useRefreshPlayerStatusState } from "../states/status";

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

  return <></>;
}
