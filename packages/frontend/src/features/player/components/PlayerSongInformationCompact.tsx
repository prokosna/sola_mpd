import { Text } from "@chakra-ui/react";

import { useCurrentSongInformationLines } from "../hooks/useCurrentSongInformationLines";

import { PlayerSongInformationTag } from "./PlayerSongInformationTag";

export function PlayerSongInformationCompact() {
  const { firstLine, secondLine } = useCurrentSongInformationLines();

  return (
    <Text noOfLines={1}>
      {`${firstLine} / ${secondLine}`}
      <PlayerSongInformationTag></PlayerSongInformationTag>
    </Text>
  );
}
