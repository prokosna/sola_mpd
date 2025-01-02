import { Box, Text } from "@chakra-ui/react";
import { displayDuration } from "@sola_mpd/domain/src/utils/stringUtils.js";

import {
  usePlayerStatusDurationState,
  usePlayerStatusElapsedState,
} from "../states/playerStatusState";

/**
 * Compact duration display component.
 *
 * Shows elapsed and total duration in a space-efficient layout,
 * with times aligned to opposite sides of the container.
 *
 * @returns Compact duration display component
 */
export function PlayerDurationCompact() {
  const playerStatusElapsed = usePlayerStatusElapsedState();
  const playerStatusDuration = usePlayerStatusDurationState();

  const elapsed =
    playerStatusElapsed === undefined
      ? ""
      : displayDuration(playerStatusElapsed);
  const duration =
    playerStatusDuration === undefined
      ? ""
      : displayDuration(playerStatusDuration);

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
