import { Flex, Stack, Text } from "@chakra-ui/react";

import { useCurrentSongInformationLines } from "../hooks/useCurrentSongInformationLines";

import { PlayerSongInformationTag } from "./PlayerSongInformationTag";

/**
 * PlayerSongInformation component displays the current song's information.
 * It uses the useCurrentSongInformationLines hook to fetch and display
 * the song's title, album, and artist information.
 *
 * @returns The rendered song information component
 */
export function PlayerSongInformation() {
  const { firstLine, secondLine, thirdLine } = useCurrentSongInformationLines();

  return (
    <Stack spacing={1} maxW="100%">
      <Flex>
        <Text noOfLines={1} flex={1}>
          {firstLine}
          <PlayerSongInformationTag></PlayerSongInformationTag>
        </Text>
      </Flex>
      <Text noOfLines={1} flex={1}>
        {secondLine}
      </Text>
      <Text noOfLines={1} flex={1}>
        {thirdLine}
      </Text>
    </Stack>
  );
}
