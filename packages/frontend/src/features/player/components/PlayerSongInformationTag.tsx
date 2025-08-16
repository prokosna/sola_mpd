import { Badge, Tooltip } from "@mantine/core";
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
		return null;
	}
	if (isDsd) {
		return (
			<Tooltip label={formatString}>
				<Badge pt={-2} size="sm" variant="outline">
					DSD
				</Badge>
			</Tooltip>
		);
	}
	if (isHiRes) {
		return (
			<Tooltip label={formatString}>
				<Badge size="sm" variant="outline">
					Hi-Res
				</Badge>
			</Tooltip>
		);
	}
	return (
		<Tooltip label={formatString}>
			<Badge size="sm" variant="outline">
				PCM
			</Badge>
		</Tooltip>
	);
}
