import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdPlayerStatus_PlaybackState } from "@sola_mpd/domain/src/models/mpd/mpd_player_pb.js";

import { useMpdClientState } from "../../mpd";
import { usePlayerStatusPlaybackState } from "../../player";
import { useCurrentMpdProfileState } from "../../profile";

import { useInputKeyCombination } from "./useInputKeyCombination";

/**
 * Global keyboard shortcut handler for media control.
 *
 * Features:
 * - Media playback control
 * - Context-aware actions
 * - Input element safety
 * - MPD command integration
 *
 * Supported Shortcuts:
 * - Space: Toggle playback
 *   - Stop → Play
 *   - Play → Pause
 *   - Pause → Play
 *
 * Implementation:
 * - Uses useInputKeyCombination for key handling
 * - Checks input element focus state
 * - Manages MPD client commands
 * - Handles connection state
 *
 * Safety Features:
 * - Ignores shortcuts when inputs focused
 * - Validates MPD client state
 * - Checks profile availability
 * - Handles all playback states
 *
 * Dependencies:
 * - MPD client connection
 * - Current MPD profile
 * - Player status state
 * - Input combination hook
 */
export function useGlobalKeyShortcuts(): void {
  const mpdClient = useMpdClientState();
  const profile = useCurrentMpdProfileState();
  const playerPlaybackState = usePlayerStatusPlaybackState();

  useInputKeyCombination(undefined, [" "], async () => {
    if (mpdClient === undefined || profile === undefined) {
      return;
    }
    switch (playerPlaybackState) {
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
