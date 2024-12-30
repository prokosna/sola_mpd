import { Box, Text } from "@chakra-ui/react";
import { displayDuration } from "@sola_mpd/domain/src/utils/stringUtils.js";

import {
  usePlayerStatusDurationState,
  usePlayerStatusElapsedState,
} from "../states/playerStatusState";

/**
 * PlayerDuration component displays the elapsed time and total duration of the currently playing track.
 * It uses the player status to fetch and display the time information.
 * The component is positioned absolutely and aligned to the right of its container.
 *
 * @returns A Box component containing the elapsed and total duration text.
 */
export function PlayerDuration() {
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
      justifyContent="end"
      p="2"
    >
      <Text fontSize={"sm"}>
        {elapsed} / {duration}
      </Text>
    </Box>
  );
}
