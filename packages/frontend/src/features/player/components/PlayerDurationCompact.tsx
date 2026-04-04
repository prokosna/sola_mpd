import { Group, Text } from "@mantine/core";
import { displayDuration } from "@sola_mpd/shared/src/utils/stringUtils.js";
import { useAtomValue } from "jotai";
import {
	playerStatusDurationAtom,
	playerStatusElapsedAtom,
} from "../states/atoms/playerStatusAtom";

/**
 * Compact duration display component.
 *
 * Shows elapsed and total duration in a space-efficient layout,
 * with times aligned to opposite sides of the container.
 *
 * @returns Compact duration display component
 */
export function PlayerDurationCompact() {
	const playerStatusElapsed = useAtomValue(playerStatusElapsedAtom);
	const playerStatusDuration = useAtomValue(playerStatusDurationAtom);

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
