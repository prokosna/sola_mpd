import { Tooltip } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useAtomValue } from "jotai";

import { mpdCapabilitiesAtom } from "../../../mpd/states/atoms/mpdCapabilitiesAtom";
import { statsAtom } from "../../../stats/states/atoms/statsAtom";

const SLOW_MODE_TOOLTIP_LABEL =
	"Slow mode; Upgrade MPD to 0.24+ for instant loading";

export function RecentlyAddedSlowModeIndicator() {
	const stats = useAtomValue(statsAtom);
	const capabilities = useAtomValue(mpdCapabilitiesAtom);

	// Wait until stats has resolved so the indicator does not flash on first
	// render before the version is known.
	if (stats === undefined) {
		return null;
	}
	if (capabilities.supportsAddedSince) {
		return null;
	}

	return (
		<Tooltip label={SLOW_MODE_TOOLTIP_LABEL}>
			<IconAlertTriangle size={16} aria-label="Slow compatibility mode" />
		</Tooltip>
	);
}
