import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdPlayerStatus_PlaybackState } from "@sola_mpd/domain/src/models/mpd/mpd_player_pb.js";
import { useCallback } from "react";
import { IoPause, IoPlay } from "react-icons/io5";

import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
import { useCurrentSongState } from "../states/song";
import { usePlayerStatusState } from "../states/status";

import { PlayerControlsButton } from "./PlayerControlsButton";

export function PlayerControlsButtonResume() {
  const profile = useCurrentMpdProfileState();
  const mpdClient = useMpdClientState();
  const currentSong = useCurrentSongState();
  const playerStatus = usePlayerStatusState();

  const onClick = useCallback(async () => {
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
              playerStatus?.playbackState ===
              MpdPlayerStatus_PlaybackState.PLAY,
          },
        },
      }),
    );
  }, [mpdClient, playerStatus?.playbackState, profile]);

  const props = {
    label:
      playerStatus?.playbackState === MpdPlayerStatus_PlaybackState.PLAY
        ? "Pause"
        : "Resume",
    isDisabled: currentSong === undefined,
    onClick,
    icon:
      playerStatus?.playbackState === MpdPlayerStatus_PlaybackState.PLAY ? (
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
