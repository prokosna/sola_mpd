import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdPlayerStatus_PlaybackState } from "@sola_mpd/domain/src/models/mpd/mpd_player_pb.js";
import { useCallback } from "react";
import { IoPause, IoPlay } from "react-icons/io5";

import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
import { useCurrentSongState } from "../states/playerSongState";
import { usePlayerStatusPlaybackState } from "../states/playerStatusState";

import { PlayerControlsButton } from "./PlayerControlsButton";

/**
 * Renders a button to play or pause the current track in the player controls.
 * This component handles the "Play/Pause" functionality in the music player,
 * toggling between play and pause states based on the current playback status.
 *
 * @returns A PlayerControlsButton component for playing or pausing the current track
 */
export function PlayerControlsButtonResume() {
  const profile = useCurrentMpdProfileState();
  const mpdClient = useMpdClientState();
  const currentSong = useCurrentSongState();
  const playerStatusPlaybackState = usePlayerStatusPlaybackState();

  const onButtonClicked = useCallback(async () => {
    if (profile === undefined || mpdClient === undefined) {
      return;
    }

    mpdClient.command(
      new MpdRequest({
        profile,
        command: {
          case: "pause",
          value: {
            pause:
              playerStatusPlaybackState === MpdPlayerStatus_PlaybackState.PLAY,
          },
        },
      }),
    );
  }, [mpdClient, playerStatusPlaybackState, profile]);

  const props = {
    label:
      playerStatusPlaybackState === MpdPlayerStatus_PlaybackState.PLAY
        ? "Pause"
        : "Resume",
    isDisabled: currentSong === undefined,
    onButtonClicked,
    icon:
      playerStatusPlaybackState === MpdPlayerStatus_PlaybackState.PLAY ? (
        <IoPause size={"24"}></IoPause>
      ) : (
        <IoPlay size={"24"}></IoPlay>
      ),
    variant: "ghost",
  };

  return (
    <>
      <PlayerControlsButton {...props}></PlayerControlsButton>
    </>
  );
}
