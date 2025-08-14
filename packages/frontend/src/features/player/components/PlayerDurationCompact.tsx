import { displayDuration } from "@sola_mpd/domain/src/utils/stringUtils.js";

import { Group, Text } from "@mantine/core";
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
		<Group pos="absolute" w="100%" justify="space-between" p={6}>
			<Text size="md">{elapsed}</Text>
			<Text size="md">{duration}</Text>
		</Group>
	);
}
