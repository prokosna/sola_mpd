import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdPlayerStatus_PlaybackState } from "@sola_mpd/domain/src/models/mpd/mpd_player_pb.js";

import { useMpdClientState } from "../../mpd";
import { usePlayerStatusState } from "../../player";
import { useCurrentMpdProfileState } from "../../profile";

import { useInputKeyCombination } from "./useInputKeyCombination";

/**
 * A custom hook that sets up global key shortcuts for media playback control.
 * This hook listens for specific key combinations and triggers corresponding
 * actions such as play/pause, next track, and previous track.
 *
 * @returns void
 */
export function useGlobalKeyShortcuts(): void {
  const mpdClient = useMpdClientState();
  const profile = useCurrentMpdProfileState();
  const playerStatus = usePlayerStatusState();

  useInputKeyCombination(undefined, [" "], async () => {
    if (mpdClient === undefined || profile === undefined) {
      return;
    }
    switch (playerStatus?.playbackState) {
      case MpdPlayerStatus_PlaybackState.STOP:
        mpdClient.command(
          new MpdRequest({
            profile,
            command: {
              case: "pause",
              value: { pause: false },
            },
          }),
        );
        break;
      case MpdPlayerStatus_PlaybackState.PAUSE:
        mpdClient.command(
          new MpdRequest({
            profile,
            command: {
              case: "pause",
              value: { pause: false },
            },
          }),
        );
        break;
      case MpdPlayerStatus_PlaybackState.PLAY:
        mpdClient.command(
          new MpdRequest({
            profile,
            command: {
              case: "pause",
              value: { pause: true },
            },
          }),
        );
        break;
      default:
        return;
    }
  });
}
