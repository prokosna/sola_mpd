import { Text, VStack } from "@chakra-ui/react";

import { useCurrentSongInformationLines } from "../hooks/useCurrentSongInformationLines";

import { PlayerSongInformationTag } from "./PlayerSongInformationTag";

/**
 * Compact song information display component.
 *
 * Shows current song details in a condensed format,
 * combining title and album on one line, artist on another.
 *
 * @returns Compact song information component
 */
export function PlayerSongInformationCompact() {
  const { firstLine, secondLine, thirdLine } = useCurrentSongInformationLines();

  return (
    <>
      <VStack spacing={1} minW="100%">
        <Text noOfLines={1}>
          {`${firstLine} / ${secondLine}`}
          <PlayerSongInformationTag></PlayerSongInformationTag>
        </Text>
        <Text noOfLines={1}>{`${thirdLine}`}</Text>
      </VStack>
    </>
  );
}
