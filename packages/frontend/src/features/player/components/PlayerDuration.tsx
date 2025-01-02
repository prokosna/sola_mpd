import { Box, Text } from "@chakra-ui/react";
import { displayDuration } from "@sola_mpd/domain/src/utils/stringUtils.js";

import {
	usePlayerStatusDurationState,
	usePlayerStatusElapsedState,
} from "../states/playerStatusState";

/**
 * Duration display component.
 *
 * Shows elapsed time and total duration of the current track.
 * Positioned absolutely and right-aligned in its container.
 *
 * @returns Duration display component
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
