import { Text, VStack } from "@chakra-ui/react";

import { useCurrentSongInformationLines } from "../hooks/useCurrentSongInformationLines";

import { PlayerSongInformationTag } from "./PlayerSongInformationTag";

/**
 * PlayerSongInformationCompact component displays a compact version of the current song's information.
 * It uses the useCurrentSongInformationLines hook to fetch and display
 * the song's title, album, and artist information in a condensed format.
 *
 * @returns The rendered compact song information component
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
