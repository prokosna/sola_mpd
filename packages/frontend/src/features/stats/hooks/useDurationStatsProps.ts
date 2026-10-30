import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { displayDuration } from "@sola_mpd/shared/src/utils/stringUtils.js";
import { useAtomValue } from "jotai";
import { useMemo } from "react";

import type { CardStatsNumberProps } from "../components/CardStatsNumber";
import { getSongsTotalDuration } from "../functions/statsCalculation";
import { statsAtom } from "../states/atoms/statsAtom";

export function useDurationStatsProps(
	showSelectedStats: boolean,
	selectedSongs: Song[],
): CardStatsNumberProps {
	const stats = useAtomValue(statsAtom);

	const count = useMemo(() => {
		if (stats === undefined) {
			return undefined;
		}
		if (showSelectedStats) {
			return displayDuration(getSongsTotalDuration(selectedSongs));
		}
		return displayDuration(stats.totalPlaytime);
	}, [showSelectedStats, selectedSongs, stats]);

	return {
		isSelected: showSelectedStats,
		label: showSelectedStats ? "Selected Songs Duration" : "Total Duration",
		count,
	};
}
