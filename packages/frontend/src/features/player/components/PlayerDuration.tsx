import { Group, Text } from "@mantine/core";
import { displayDuration } from "@sola_mpd/shared/src/utils/stringUtils.js";
import { useAtomValue } from "jotai";
import {
	playerStatusDurationAtom,
	playerStatusElapsedAtom,
} from "../states/atoms/playerStatusAtom";

/**
 * Duration display component.
 *
 * Shows elapsed time and total duration of the current track.
 * Positioned absolutely and right-aligned in its container.
 *
 * @returns Duration display component
 */
export function PlayerDuration() {
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
		<Group pos="absolute" w="100%" justify="flex-end" p={6}>
			<Text size="md">
				{elapsed} / {duration}
			</Text>
		</Group>
	);
}
