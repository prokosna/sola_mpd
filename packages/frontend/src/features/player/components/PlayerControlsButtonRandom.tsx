import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { useCallback } from "react";
import { IoShuffleOutline } from "react-icons/io5";

import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
import { useCurrentSongState } from "../states/song";
import { usePlayerStatusState } from "../states/status";

import { PlayerControlsButton } from "./PlayerControlsButton";

export function PlayerControlsButtonRandom() {
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
    onClick,
    icon: <IoShuffleOutline size={"24"}></IoShuffleOutline>,
    variant: playerStatus?.isRandom ? "solid" : "ghost",
  };

  return (
    <>
      <PlayerControlsButton {...props}></PlayerControlsButton>
    </>
  );
}
