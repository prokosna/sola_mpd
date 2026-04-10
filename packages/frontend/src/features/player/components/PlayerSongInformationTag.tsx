import { Badge, Tooltip } from "@mantine/core";
import { useCurrentSongFormat } from "../hooks/useCurrentSongFormat";

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
