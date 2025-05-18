import { Flex, Stack, Text } from "@chakra-ui/react";

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
		<Stack gap={1} maxW="100%">
			<Flex>
				<Text lineClamp={1} flex={1}>
					{firstLine}
					<PlayerSongInformationTag />
				</Text>
			</Flex>
			<Text lineClamp={1} flex={1}>
				{secondLine}
			</Text>
			<Text lineClamp={1} flex={1}>
				{thirdLine}
			</Text>
		</Stack>
	);
}
