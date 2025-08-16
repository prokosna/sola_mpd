import { Box, Group, Stack } from "@mantine/core";
import { useIsCompactMode } from "../../user_device";

import { PlayerCompact } from "./PlayerCompact";
import { PlayerControls } from "./PlayerControls";
import { PlayerDuration } from "./PlayerDuration";
import { PlayerObserver } from "./PlayerObserver";
import { PlayerSeekBar } from "./PlayerSeekBar";
import { PlayerSongInformation } from "./PlayerSongInformation";

/**
 * Main player component with playback controls and information.
 *
 * Provides a responsive layout that switches between full-size
 * and compact modes. Full-size includes a seek bar, duration,
 * and two-column layout, while compact mode shows essential
 * controls in a single row.
 *
 * @returns Player with responsive layout
 */
export function Player() {
	const isCompact = useIsCompactMode();

	if (isCompact) {
		return <PlayerCompact />;
	}

	return (
		<>
			<Stack w="100vw" h="100%">
				<PlayerSeekBar />
				<PlayerDuration />
				<Group w="100%" h="100%" px={12} pt={6} align="center" pos="absolute">
					<Group
						w="100%"
						gap={2}
						align="center"
						justify="space-between"
						wrap="nowrap"
					>
						<Box flex={1} miw="0">
							<PlayerSongInformation />
						</Box>
						<Group justify="flex-end" gap={0} align="center">
							<PlayerControls />
						</Group>
					</Group>
				</Group>
			</Stack>
			<PlayerObserver />
		</>
	);
}
