import { Group, Stack } from "@mantine/core";
import { PlayerControlsCompact } from "./PlayerControlsCompact";
import { PlayerDurationCompact } from "./PlayerDurationCompact";
import { PlayerObserver } from "./PlayerObserver";
import { PlayerSeekBar } from "./PlayerSeekBar";
import { PlayerSongInformationCompact } from "./PlayerSongInformationCompact";

export function PlayerCompact() {
	return (
		<>
			<Stack w="100vw" h="100%">
				<PlayerSeekBar />
				<PlayerDurationCompact />
				<Group w="100%" h="100%" px={12} pt={6} pos="absolute">
					<Stack w="100%" gap={2}>
						<Group w="100%" justify={"center"}>
							<PlayerSongInformationCompact />
						</Group>
						<Group w="100%" justify={"center"} gap={0}>
							<PlayerControlsCompact />
						</Group>
					</Stack>
				</Group>
			</Stack>
			<PlayerObserver />
		</>
	);
}
