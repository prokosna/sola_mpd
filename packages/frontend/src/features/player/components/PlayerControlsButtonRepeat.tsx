import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { useCallback } from "react";
import { IoRepeatOutline } from "react-icons/io5";

import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
import { useCurrentSongState } from "../states/playerSongState";
import { usePlayerStatusState } from "../states/playerStatusState";

import { PlayerControlsButton } from "./PlayerControlsButton";

/**
 * Renders a button to toggle the repeat mode in the player controls.
 * This component handles the "Repeat" functionality in the music player.
 *
 * @returns A PlayerControlsButton component for toggling repeat mode
 */
export function PlayerControlsButtonRepeat() {
  const profile = useCurrentMpdProfileState();
  const mpdClient = useMpdClientState();
  const currentSong = useCurrentSongState();
  const playerStatus = usePlayerStatusState();

  const onButtonClicked = useCallback(async () => {
    if (mpdClient === undefined) {
      return;
    }

    mpdClient.command(
      new MpdRequest({
        profile,
        command: {
          case: "repeat",
          value: {
            enable: !playerStatus?.isRepeat,
          },
        },
      }),
    );
  }, [mpdClient, playerStatus?.isRepeat, profile]);

  const props = {
    label: playerStatus?.isRepeat ? "Repeat enabled" : "Repeat disabled",
    isDisabled: currentSong === undefined,
    onButtonClicked,
    icon: <IoRepeatOutline size={"24"}></IoRepeatOutline>,
    variant: playerStatus?.isRepeat ? "solid" : "ghost",
  };

  return (
    <>
      <PlayerControlsButton {...props}></PlayerControlsButton>
    </>
  );
}
