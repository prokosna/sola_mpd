import { Slider, SliderFilledTrack, SliderTrack } from "@chakra-ui/react";
import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { useCallback, useRef } from "react";

import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
import { usePlayerStatusState } from "../states/playerStatusState";
import { getElapsedTimePercentage } from "../utils/playerDisplayUtils";

/**
 * PlayerSeekBar component renders a slider for seeking through the current track.
 * It displays the progress of the currently playing song and allows users to
 * change the playback position by interacting with the slider.
 *
 * @returns A Slider component representing the seek bar of the player
 */
export function PlayerSeekBar() {
  const profile = useCurrentMpdProfileState();
  const mpdClient = useMpdClientState();
  const playerStatus = usePlayerStatusState();

  const elapsedTimePercentage = getElapsedTimePercentage(playerStatus);

  const lastSeekClicked = useRef(new Date());
  const handleSeekBarClick = useCallback(
    async (value: number) => {
      if (profile === undefined || mpdClient === undefined) {
        return;
      }

      if (value < 0 || value > 100) {
        return;
      }

      if (playerStatus?.duration === undefined) {
        return;
      }

      // It is possible that onChange() is fired frequently.
      const now = new Date();
      const last = lastSeekClicked.current;
      const elapsed = now.getTime() - last.getTime();
      if (elapsed < 1000) {
        return;
      }
      lastSeekClicked.current = now;

      const seekTo = (value / 100) * playerStatus.duration;
      mpdClient.command(
        new MpdRequest({
          profile,
          command: {
            case: "seek",
            value: {
              target: {
                case: "current",
                value: true,
              },
              time: seekTo,
            },
          },
        }),
      );
    },
    [mpdClient, playerStatus?.duration, profile],
  );

  return (
    <Slider
      m={0}
      p={0}
      w="100%"
      min={0}
      max={100}
      value={elapsedTimePercentage}
      colorScheme="brand"
      onChange={(v) => {
        handleSeekBarClick(v);
      }}
    >
      <SliderTrack h="10px">
        <SliderFilledTrack h="15px"></SliderFilledTrack>
      </SliderTrack>
    </Slider>
  );
}
