import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { useCallback } from "react";
import { IoShuffleOutline } from "react-icons/io5";

import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
import { useCurrentSongState } from "../states/playerSongState";
import { usePlayerStatusState } from "../states/playerStatusState";

import { PlayerControlsButton } from "./PlayerControlsButton";

/**
 * Renders a button to toggle the random playback mode in the player controls.
 * This component handles the "Random" functionality in the music player.
 *
 * @returns A PlayerControlsButton component for toggling random playback mode
 */
export function PlayerControlsButtonRandom() {
  const profile = useCurrentMpdProfileState();
  const mpdClient = useMpdClientState();
  const currentSong = useCurrentSongState();
  const playerStatus = usePlayerStatusState();

  const onButtonClicked = useCallback(async () => {
    if (profile === undefined || mpdClient === undefined) {
      return;
    }

    mpdClient.command(
      new MpdRequest({
        profile,
        command: {
          case: "random",
          value: {
            enable: !playerStatus?.isRandom,
          },
        },
      }),
    );
  }, [mpdClient, playerStatus?.isRandom, profile]);

  const props = {
    label: playerStatus?.isRandom ? "Random enabled" : "Random disabled",
    isDisabled: currentSong === undefined,
    onButtonClicked,
    icon: <IoShuffleOutline size={"24"}></IoShuffleOutline>,
    variant: playerStatus?.isRandom ? "solid" : "ghost",
  };

  return (
    <>
      <PlayerControlsButton {...props}></PlayerControlsButton>
    </>
  );
}
