import { useAppStore } from "../store/AppStore";

import { useKeyCombination } from "@/frontend/common_hooks/useKeyCombination";
import { MpdRequest } from "@/models/mpd/mpd_command";
import { MpdPlayerStatusPlaybackState } from "@/models/mpd/mpd_player";
import { MpdUtils } from "@/utils/MpdUtils";

export function useGlobalKeyShortcuts() {
  const profile = useAppStore((state) => state.profileState?.currentProfile);
  const mpdPlayerStatus = useAppStore((state) => state.mpdPlayerStatus);

  useKeyCombination(undefined, [" "], async () => {
    if (profile === undefined) {
      return;
    }
    let command;
    switch (mpdPlayerStatus?.playbackState) {
      case MpdPlayerStatusPlaybackState.STOP:
        command = MpdRequest.create({
          profile,
          command: {
            $case: "pause",
            pause: { pause: false },
          },
        });
        break;
      case MpdPlayerStatusPlaybackState.PAUSE:
        command = MpdRequest.create({
          profile,
          command: {
            $case: "pause",
            pause: { pause: false },
          },
        });
        break;
      case MpdPlayerStatusPlaybackState.PLAY:
        command = MpdRequest.create({
          profile,
          command: {
            $case: "pause",
            pause: { pause: true },
          },
        });
        break;
      default:
        return;
    }
    await MpdUtils.command(command);
  });
}
