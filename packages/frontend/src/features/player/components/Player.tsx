import { Flex, Grid, GridItem } from "@chakra-ui/react";

import { useIsCompactMode } from "../../user_device";

import { PlayerCompact } from "./PlayerCompact";
import { PlayerControls } from "./PlayerControls";
import { PlayerDuration } from "./PlayerDuration";
import { PlayerObserver } from "./PlayerObserver";
import { PlayerSeekBar } from "./PlayerSeekBar";
import { PlayerSongInformation } from "./PlayerSongInformation";

export function Player() {
  const isCompact = useIsCompactMode();

  if (isCompact) {
    return <PlayerCompact />;
  }

  return (
    <>
      <Flex direction={"column"} w="100vw" h="full" position="relative">
        <PlayerSeekBar></PlayerSeekBar>
        <PlayerDuration></PlayerDuration>
        <Grid
          className="player-surface-grid"
          templateAreas={`"info control"`}
          gridTemplateColumns={"minmax(0, 1fr) 366px"}
          h="full"
          gap="0"
        >
          <GridItem area={"info"}>
            <Flex h="full" pl="3" pt="2" align={"center"} justify={"start"}>
              <PlayerSongInformation></PlayerSongInformation>
            </Flex>
          </GridItem>
          <GridItem area={"control"}>
            <Flex h="full" pr="5" align={"center"} justify={"end"}>
              <PlayerControls></PlayerControls>
            </Flex>
          </GridItem>
        </Grid>
      </Flex>
      <PlayerObserver></PlayerObserver>
    </>
  );
}
