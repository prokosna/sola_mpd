import { Flex, Grid, GridItem } from "@chakra-ui/react";

import { PlayerControlsCompact } from "./PlayerControlsCompact";
import { PlayerDurationCompact } from "./PlayerDurationCompact";
import { PlayerObserver } from "./PlayerObserver";
import { PlayerSeekBar } from "./PlayerSeekBar";
import { PlayerSongInformationCompact } from "./PlayerSongInformationCompact";

/**
 * Compact version of the player component.
 *
 * Arranges seek bar, duration, song info, and controls in a
 * vertical layout optimized for smaller screens or minimized
 * views.
 *
 * @returns Compact player component
 */
export function PlayerCompact() {
	return (
		<>
			<Flex direction={"column"} w="100vw" h="100%" position="relative">
				<PlayerSeekBar />
				<PlayerDurationCompact />
				<Grid
					className="player-surface-grid"
					templateAreas={`"info"
                          "control"`}
					gridTemplateRows={"1fr 1fr"}
					h="100%"
					gap="0"
				>
					<GridItem area={"info"}>
						<Flex
							h="100%"
							pt="2"
							pl="2"
							pr="2"
							align={"center"}
							justify={"center"}
						>
							<PlayerSongInformationCompact />
						</Flex>
					</GridItem>
					<GridItem area={"control"}>
						<Flex h="10" p="2" align={"center"} justify={"center"}>
							<PlayerControlsCompact />
						</Flex>
					</GridItem>
				</Grid>
			</Flex>
			<PlayerObserver />
		</>
	);
}
