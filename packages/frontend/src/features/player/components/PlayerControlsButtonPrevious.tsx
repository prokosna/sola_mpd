import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { useCallback } from "react";
import { IoPlaySkipBack } from "react-icons/io5";

import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
import { useCurrentSongState } from "../states/song";

import { PlayerControlsButton } from "./PlayerControlsButton";

export function PlayerControlsButtonPrevious() {
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
          case: "previous",
          value: {},
        },
      }),
    );
  }, [mpdClient, profile]);

  const props = {
    label: "Play previous",
    isDisabled: currentSong === undefined,
    onClick,
    icon: <IoPlaySkipBack size={"24"}></IoPlaySkipBack>,
    variant: "ghost",
  };

  return (
    <>
      <PlayerControlsButton {...props}></PlayerControlsButton>
    </>
  );
}
