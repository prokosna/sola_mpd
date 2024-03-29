import { Flex, Grid, GridItem } from "@chakra-ui/react";

import { PlayerControls } from "./PlayerControls";
import { PlayerObserver } from "./PlayerObserver";
import { PlayerSeekBar } from "./PlayerSeekBar";
import { PlayerSongInformation } from "./PlayerSongInformation";

export function Player() {
  return (
    <>
      <Flex direction={"column"} w="100vw" h="full">
        <PlayerSeekBar></PlayerSeekBar>
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
