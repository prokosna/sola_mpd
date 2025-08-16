import { Group, Stack, Text } from "@mantine/core";
import { useCurrentSongInformationLines } from "../hooks/useCurrentSongInformationLines";

import { PlayerSongInformationTag } from "./PlayerSongInformationTag";

/**
 * Song information display component.
 *
 * Shows current song details including title, album, and
 * artist information in a stacked layout.
 *
 * @returns Song information component
 */
export function PlayerSongInformation() {
	const { firstLine, secondLine, thirdLine } = useCurrentSongInformationLines();

	return (
		<Stack gap={1} w="100%">
			<Group wrap="nowrap">
				<Text
					style={{
						whiteSpace: "nowrap",
						overflow: "hidden",
						textOverflow: "ellipsis",
					}}
				>
					{firstLine}
				</Text>
				<Group miw={50} align="center">
					<PlayerSongInformationTag />
				</Group>
			</Group>
			<Text
				style={{
					whiteSpace: "nowrap",
					overflow: "hidden",
					textOverflow: "ellipsis",
				}}
			>
				{secondLine}
			</Text>
			<Text
				style={{
					whiteSpace: "nowrap",
					overflow: "hidden",
					textOverflow: "ellipsis",
				}}
			>
				{thirdLine}
			</Text>
		</Stack>
	);
}
