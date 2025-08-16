import { Group, Stack, Text } from "@mantine/core";
import { useCurrentSongFormat } from "../hooks/useCurrentSongFormat";
import { useCurrentSongInformationLines } from "../hooks/useCurrentSongInformationLines";
import { PlayerSongInformationTag } from "./PlayerSongInformationTag";

/**
 * Compact song information display component.
 *
 * Shows current song details in a condensed format,
 * combining title and album on one line, artist on another.
 *
 * @returns Compact song information component
 */
export function PlayerSongInformationCompact() {
	const { firstLine, secondLine, thirdLine } = useCurrentSongInformationLines();
	const { formatString } = useCurrentSongFormat();

	return (
		<Stack gap={0} maw="80%" justify="center">
			<Group wrap="nowrap" justify="center">
				<Text
					ta="center"
					style={{
						whiteSpace: "nowrap",
						overflow: "hidden",
						textOverflow: "ellipsis",
					}}
				>
					{`${[firstLine, secondLine].filter((line) => line !== "").join(" / ")}`}
				</Text>
				{formatString === "" ? null : (
					<Group miw={50} align="center">
						<PlayerSongInformationTag />
					</Group>
				)}
			</Group>
			<Text
				ta="center"
				style={{
					whiteSpace: "nowrap",
					overflow: "hidden",
					textOverflow: "ellipsis",
				}}
			>
				{thirdLine || "-"}
			</Text>
		</Stack>
	);
}
