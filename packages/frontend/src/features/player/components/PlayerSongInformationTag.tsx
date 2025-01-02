import { Tag, TagLabel, Tooltip } from "@chakra-ui/react";

import { useCurrentSongFormat } from "../hooks/useCurrentSongFormat";

/**
 * Audio format indicator tag.
 *
 * Displays DSD, Hi-Res, or PCM tag based on current song's
 * audio format. Shows detailed format info in tooltip.
 *
 * @returns Audio format tag with tooltip
 */
export function PlayerSongInformationTag() {
	const { isHiRes, isDsd, formatString } = useCurrentSongFormat();

	if (formatString === "") {
		return <></>;
	}
	if (isDsd) {
		return (
			<Tooltip label={formatString} placement="top-end">
				<Tag px={1} ml={2} size={"sm"} variant="outline" colorScheme="teal">
					<TagLabel>DSD</TagLabel>
				</Tag>
			</Tooltip>
		);
	}
	if (isHiRes) {
		return (
			<Tooltip label={formatString} placement="top-end">
				<Tag px={1} ml={2} size={"sm"} variant="outline" colorScheme="teal">
					<TagLabel>Hi-Res</TagLabel>
				</Tag>
			</Tooltip>
		);
	}
	return (
		<Tooltip label={formatString} placement="top-end">
			<Tag px={1} ml={2} size={"sm"} variant="outline" colorScheme="teal">
				<TagLabel>PCM</TagLabel>
			</Tag>
		</Tooltip>
	);
}
