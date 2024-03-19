import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { useCallback } from "react";
import { IoRestaurantOutline } from "react-icons/io5";

import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
import { useCurrentSongState } from "../states/song";
import { usePlayerStatusState } from "../states/status";

import { PlayerControlsButton } from "./PlayerControlsButton";

export function PlayerControlsButtonConsume() {
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
          case: "consume",
          value: {
            enable: !playerStatus?.isConsume,
          },
        },
      }),
    );
  }, [mpdClient, playerStatus?.isConsume, profile]);

  const props = {
    label: playerStatus?.isConsume ? "Consume enabled" : "Consume disabled",
    isDisabled: currentSong === undefined,
    onClick,
    icon: <IoRestaurantOutline size={"24"}></IoRestaurantOutline>,
    variant: playerStatus?.isConsume ? "solid" : "ghost",
  };

  return (
    <>
      <PlayerControlsButton {...props}></PlayerControlsButton>
    </>
  );
}
