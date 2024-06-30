import { Box, Text } from "@chakra-ui/react";
import { StringUtils } from "@sola_mpd/domain/src/utils/StringUtils.js";

import { usePlayerStatusState } from "../states/status";

export function PlayerDurationCompact() {
  const playerStatus = usePlayerStatusState();

  const elapsed =
    playerStatus?.elapsed === undefined
      ? ""
      : StringUtils.displayDuration(playerStatus.elapsed);
  const duration =
    playerStatus?.duration === undefined
      ? ""
      : StringUtils.displayDuration(playerStatus.duration);

  return (
    <Box
      position="absolute"
      left="0"
      right="0"
      display="flex"
      justifyContent="space-between"
      p="2"
    >
      <Text fontSize={"sm"}>{elapsed}</Text>
      <Text fontSize={"sm"}>{duration}</Text>
    </Box>
  );
}
