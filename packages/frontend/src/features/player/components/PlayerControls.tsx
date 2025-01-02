import { Center, Divider } from "@chakra-ui/react";

import { PlayerControlsButtonConsume } from "./PlayerControlsButtonConsume";
import { PlayerControlsButtonNext } from "./PlayerControlsButtonNext";
import { PlayerControlsButtonPrevious } from "./PlayerControlsButtonPrevious";
import { PlayerControlsButtonRandom } from "./PlayerControlsButtonRandom";
import { PlayerControlsButtonRepeat } from "./PlayerControlsButtonRepeat";
import { PlayerControlsButtonResume } from "./PlayerControlsButtonResume";
import { PlayerControlsButtonStop } from "./PlayerControlsButtonStop";
import { PlayerControlsButtonVolume } from "./PlayerControlsButtonVolume";

/**
 * Full-size player controls component.
 *
 * Displays playback controls (previous, stop, play/pause, next),
 * playback modes (random, repeat, consume), and volume control,
 * organized with visual dividers.
 *
 * @returns Player controls component
 */
export function PlayerControls() {
  return (
    <>
      <PlayerControlsButtonPrevious></PlayerControlsButtonPrevious>
      <PlayerControlsButtonStop></PlayerControlsButtonStop>
      <PlayerControlsButtonResume></PlayerControlsButtonResume>
      <PlayerControlsButtonNext></PlayerControlsButtonNext>

      <Center h="30%">
        <Divider orientation="vertical"></Divider>
      </Center>

      <PlayerControlsButtonRandom></PlayerControlsButtonRandom>
      <PlayerControlsButtonRepeat></PlayerControlsButtonRepeat>
      <PlayerControlsButtonConsume></PlayerControlsButtonConsume>

      <Center h="30%">
        <Divider orientation="vertical"></Divider>
      </Center>

      <PlayerControlsButtonVolume></PlayerControlsButtonVolume>
    </>
  );
}
