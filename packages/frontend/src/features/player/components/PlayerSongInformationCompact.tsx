import { HStack, Text, VStack } from "@chakra-ui/react";

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

	return (
		<>
			<VStack gap={1} minW="100%" paddingX={12}>
				<HStack gap={2} width="100%">
					<Text lineClamp={1} flex="1">
						{`${firstLine} / ${secondLine}`}
					</Text>
					<PlayerSongInformationTag />
				</HStack>
				<Text lineClamp={1}>{`${thirdLine}`}</Text>
			</VStack>
		</>
	);
}
