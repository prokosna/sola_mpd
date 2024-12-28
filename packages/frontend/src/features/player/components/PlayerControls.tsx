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
 * Renders the player controls component.
 * This component includes buttons for previous track, stop, play/pause, next track,
 * random playback, repeat, consume mode, and volume control.
 * The buttons are separated by vertical dividers for better visual organization.
 *
 * @returns The rendered PlayerControls component
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
