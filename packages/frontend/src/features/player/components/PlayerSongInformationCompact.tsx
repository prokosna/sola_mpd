import { Text, VStack } from "@chakra-ui/react";

import { useCurrentSongInformationLines } from "../hooks/useCurrentSongInformationLines";

import { PlayerSongInformationTag } from "./PlayerSongInformationTag";

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
