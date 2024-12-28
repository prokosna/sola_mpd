import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { useCallback } from "react";
import { IoPlaySkipForward } from "react-icons/io5";

import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
import { useCurrentSongState } from "../states/playerSongState";

import { PlayerControlsButton } from "./PlayerControlsButton";

/**
 * Renders a button to play the next track in the player controls.
 * This component handles the "Next" functionality in the music player.
 *
 * @returns A PlayerControlsButton component for playing the next track
 */
export function PlayerControlsButtonNext() {
  const profile = useCurrentMpdProfileState();
  const mpdClient = useMpdClientState();
  const currentSong = useCurrentSongState();

  const onButtonClicked = useCallback(async () => {
    if (profile === undefined || mpdClient === undefined) {
      return;
    }

    mpdClient.command(
      new MpdRequest({
        profile,
        command: {
          case: "next",
          value: {},
        },
      }),
    );
  }, [mpdClient, profile]);

  const props = {
    label: "Play next",
    isDisabled: currentSong === undefined,
    onButtonClicked,
    icon: <IoPlaySkipForward size={"24"}></IoPlaySkipForward>,
    variant: "ghost",
  };

  return (
    <>
      <PlayerControlsButton {...props}></PlayerControlsButton>
    </>
  );
}
