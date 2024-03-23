import { Center, Divider } from "@chakra-ui/react";

import { PlayerControlsButtonConsume } from "./PlayerControlsButtonConsume";
import { PlayerControlsButtonNext } from "./PlayerControlsButtonNext";
import { PlayerControlsButtonPrevious } from "./PlayerControlsButtonPrevious";
import { PlayerControlsButtonRandom } from "./PlayerControlsButtonRandom";
import { PlayerControlsButtonRepeat } from "./PlayerControlsButtonRepeat";
import { PlayerControlsButtonResume } from "./PlayerControlsButtonResume";
import { PlayerControlsButtonStop } from "./PlayerControlsButtonStop";
import { PlayerControlsButtonVolume } from "./PlayerControlsButtonVolume";

export function PlayerControls() {
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
