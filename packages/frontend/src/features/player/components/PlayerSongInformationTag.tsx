import { Tag } from "@chakra-ui/react";

import { Tooltip } from "../../../components/ui/tooltip";
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
			<Tooltip content={formatString} positioning={{ placement: "top-end" }}>
				<Tag.Root
					px={1}
					ml={2}
					size={"sm"}
					variant="outline"
					colorScheme="teal"
				>
					<Tag.Label>DSD</Tag.Label>
				</Tag.Root>
			</Tooltip>
		);
	}
	if (isHiRes) {
		return (
			<Tooltip content={formatString} positioning={{ placement: "top-end" }}>
				<Tag.Root
					px={1}
					ml={2}
					size={"sm"}
					variant="outline"
					colorScheme="teal"
				>
					<Tag.Label>Hi-Res</Tag.Label>
				</Tag.Root>
			</Tooltip>
		);
	}
	return (
		<Tooltip content={formatString} positioning={{ placement: "top-end" }}>
			<Tag.Root px={1} ml={2} size={"sm"} variant="outline" colorScheme="teal">
				<Tag.Label>PCM</Tag.Label>
			</Tag.Root>
		</Tooltip>
	);
}
