import { displayDuration } from "@sola_mpd/domain/src/utils/stringUtils.js";

import { Group, Text } from "@mantine/core";
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
		<Group pos="absolute" w="100%" justify="flex-end" p={6}>
			<Text size="md">
				{elapsed} / {duration}
			</Text>
		</Group>
	);
}
