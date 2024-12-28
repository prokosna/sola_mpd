import { Flex, Grid, GridItem } from "@chakra-ui/react";

import { PlayerControlsCompact } from "./PlayerControlsCompact";
import { PlayerDurationCompact } from "./PlayerDurationCompact";
import { PlayerObserver } from "./PlayerObserver";
import { PlayerSeekBar } from "./PlayerSeekBar";
import { PlayerSongInformationCompact } from "./PlayerSongInformationCompact";

/**
 * Renders a compact version of the player component.
 * This component includes a seek bar, duration display, song information,
 * and controls, all arranged in a compact layout suitable for smaller screens
 * or minimized views.
 *
 * @returns JSX.Element The compact player component
 */
export function PlayerCompact() {
  return (
    <>
      <Flex direction={"column"} w="100vw" h="full" position="relative">
        <PlayerSeekBar></PlayerSeekBar>
        <PlayerDurationCompact></PlayerDurationCompact>
        <Grid
          className="player-surface-grid"
          templateAreas={`"info"
                          "control"`}
          gridTemplateRows={"1fr 1fr"}
          h="full"
          gap="0"
        >
          <GridItem area={"info"}>
            <Flex
              h="full"
              pt="2"
              pl="2"
              pr="2"
              align={"center"}
              justify={"center"}
            >
              <PlayerSongInformationCompact />
            </Flex>
          </GridItem>
          <GridItem area={"control"}>
            <Flex h="10" p="2" align={"center"} justify={"center"}>
              <PlayerControlsCompact />
            </Flex>
          </GridItem>
        </Grid>
      </Flex>
      <PlayerObserver></PlayerObserver>
    </>
  );
}
