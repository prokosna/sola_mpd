import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { useCallback } from "react";
import { IoRestaurantOutline } from "react-icons/io5";

import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
import { useCurrentSongState } from "../states/playerSongState";
import { usePlayerStatusIsConsumeState } from "../states/playerStatusState";

import { PlayerControlsButton } from "./PlayerControlsButton";

/**
 * Renders a button to toggle the consume mode in the player controls.
 * When consume mode is enabled, each song played is removed from the playlist.
 *
 * @returns A PlayerControlsButton component for toggling consume mode
 */
export function PlayerControlsButtonConsume() {
  const profile = useCurrentMpdProfileState();
  const mpdClient = useMpdClientState();
  const currentSong = useCurrentSongState();
  const playerStatusIsConsume = usePlayerStatusIsConsumeState();

  const onButtonClicked = useCallback(async () => {
    if (profile === undefined || mpdClient === undefined) {
      return;
    }
    mpdClient.command(
      new MpdRequest({
        profile,
        command: {
          case: "consume",
          value: {
            enable: !playerStatusIsConsume,
          },
        },
      }),
    );
  }, [mpdClient, playerStatusIsConsume, profile]);

  const props = {
    label: playerStatusIsConsume ? "Consume enabled" : "Consume disabled",
    isDisabled: currentSong === undefined,
    onButtonClicked,
    icon: <IoRestaurantOutline size={"24"}></IoRestaurantOutline>,
    variant: playerStatusIsConsume ? "solid" : "ghost",
  };

  return (
    <>
      <PlayerControlsButton {...props}></PlayerControlsButton>
    </>
  );
}
