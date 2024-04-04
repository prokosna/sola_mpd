import { Flex, Grid, GridItem } from "@chakra-ui/react";

import { PlayerControlsCompact } from "./PlayerControlsCompact";
import { PlayerObserver } from "./PlayerObserver";
import { PlayerSeekBar } from "./PlayerSeekBar";
import { PlayerSongInformationCompact } from "./PlayerSongInformationCompact";

export function PlayerCompact() {
  return (
    <>
      <Flex direction={"column"} w="100vw" h="full">
        <PlayerSeekBar></PlayerSeekBar>
        <Grid
          className="player-surface-grid"
          templateAreas={`"info"
                          "control"`}
          gridTemplateRows={"1fr 1fr"}
          h="full"
          gap="0"
        >
          <GridItem area={"info"}>
            <Flex h="full" pt="2" align={"center"} justify={"center"}>
              <PlayerSongInformationCompact />
            </Flex>
          </GridItem>
          <GridItem area={"control"}>
            <Flex h="full" pb="2" align={"center"} justify={"center"}>
              <PlayerControlsCompact />
            </Flex>
          </GridItem>
        </Grid>
      </Flex>
      <PlayerObserver></PlayerObserver>
    </>
  );
}
