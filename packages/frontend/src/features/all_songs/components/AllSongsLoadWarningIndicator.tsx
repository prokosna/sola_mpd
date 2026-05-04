import { Tooltip } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

const ALL_SONGS_LOAD_WARNING_LABEL =
	"Loads the entire library; can be slow on large collections";

export function AllSongsLoadWarningIndicator() {
	return (
		<Tooltip label={ALL_SONGS_LOAD_WARNING_LABEL}>
			<IconAlertCircle size={16} aria-label="Heavy load" />
		</Tooltip>
	);
}
