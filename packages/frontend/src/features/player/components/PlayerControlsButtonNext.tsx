import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { useCallback } from "react";
import { IoPlaySkipForward } from "react-icons/io5";

import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
import { useCurrentSongState } from "../states/song";

import { PlayerControlsButton } from "./PlayerControlsButton";

export function PlayerControlsButtonNext() {
  const profile = useCurrentMpdProfileState();
  const mpdClient = useMpdClientState();
  const currentSong = useCurrentSongState();

  const onClick = useCallback(async () => {
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
    onClick,
    icon: <IoPlaySkipForward size={"24"}></IoPlaySkipForward>,
    variant: "ghost",
  };

  return (
    <>
      <PlayerControlsButton {...props}></PlayerControlsButton>
    </>
  );
}
