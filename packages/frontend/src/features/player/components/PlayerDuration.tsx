import { Box, Text } from "@chakra-ui/react";
import { displayDuration } from "@sola_mpd/domain/src/utils/stringUtils.js";

import { usePlayerStatusState } from "../states/playerStatusState";

/**
 * PlayerDuration component displays the elapsed time and total duration of the currently playing track.
 * It uses the player status to fetch and display the time information.
 * The component is positioned absolutely and aligned to the right of its container.
 *
 * @returns A Box component containing the elapsed and total duration text.
 */
export function PlayerDuration() {
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
      justifyContent="end"
      p="2"
    >
      <Text fontSize={"sm"}>
        {elapsed} / {duration}
      </Text>
    </Box>
  );
}
