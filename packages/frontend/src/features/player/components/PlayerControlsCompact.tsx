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
 * Renders a compact version of the player controls.
 * This component includes buttons for previous track, stop, play/pause, and next track,
 * as well as additional controls separated by a vertical divider.
 *
 * @returns The rendered PlayerControlsCompact component
 */
export function PlayerControlsCompact() {
  return (
    <>
      <PlayerControlsButtonPrevious></PlayerControlsButtonPrevious>
      <PlayerControlsButtonStop></PlayerControlsButtonStop>
      <PlayerControlsButtonResume></PlayerControlsButtonResume>
      <PlayerControlsButtonNext></PlayerControlsButtonNext>

      <Center h="50%">
        <Divider orientation="vertical"></Divider>
      </Center>

      <PlayerControlsButtonRandom></PlayerControlsButtonRandom>
      <PlayerControlsButtonRepeat></PlayerControlsButtonRepeat>
      <PlayerControlsButtonConsume></PlayerControlsButtonConsume>

      <Center h="50%">
        <Divider orientation="vertical"></Divider>
      </Center>

      <PlayerControlsButtonVolume></PlayerControlsButtonVolume>
    </>
  );
}
