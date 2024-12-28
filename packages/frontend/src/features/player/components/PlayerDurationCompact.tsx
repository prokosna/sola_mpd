import { Box, Text } from "@chakra-ui/react";
import { displayDuration } from "@sola_mpd/domain/src/utils/stringUtils.js";

import { usePlayerStatusState } from "../states/playerStatusState";

/**
 * Renders a compact version of the player duration display.
 * This component shows the elapsed time and total duration of the current track
 * in a space-efficient layout, suitable for smaller screens or minimized views.
 * It uses the player status to fetch and display the time information.
 *
 * @returns A Box component containing the elapsed and total duration text.
 */
export function PlayerDurationCompact() {
  const playerStatus = usePlayerStatusState();

  const elapsed =
    playerStatus?.elapsed === undefined
      ? ""
      : displayDuration(playerStatus.elapsed);
  const duration =
    playerStatus?.duration === undefined
      ? ""
      : displayDuration(playerStatus.duration);

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
