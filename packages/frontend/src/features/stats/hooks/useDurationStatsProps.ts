import {
	type Song,
	Song_MetadataTag,
} from "@sola_mpd/domain/src/models/song_pb.js";
import { getSongMetadataAsNumber } from "@sola_mpd/domain/src/utils/songUtils.js";
import { displayDuration } from "@sola_mpd/domain/src/utils/stringUtils.js";
import { useMemo } from "react";

import type { CardStatsNumberProps } from "../components/CardStatsNumber";
import { useStatsState } from "../states/statsState";

/**
 * Custom hook to generate props for duration statistics.
 *
 * @param showSelectedStats - Boolean flag to determine if stats for selected songs should be shown.
 * @param selectedSongs - Array of selected Song objects.
 * @returns CardStatsNumberProps object containing duration statistics.
 */
export function useDurationStatsProps(
	showSelectedStats: boolean,
	selectedSongs: Song[],
): CardStatsNumberProps {
	const stats = useStatsState();

	const count = useMemo(() => {
		if (stats === undefined) {
			return undefined;
		}
		if (showSelectedStats) {
			return displayDuration(
				selectedSongs
					.map((song) =>
						getSongMetadataAsNumber(song, Song_MetadataTag.DURATION),
					)
					.filter((value) => value !== undefined)
					.filter((value) => !Number.isNaN(Number(value)))
					.reduce((a, b) => (a as number) + (b as number), 0) as number,
			);
		}
		return displayDuration(stats.totalPlaytime);
	}, [showSelectedStats, selectedSongs, stats]);

	return {
		isSelected: showSelectedStats,
		label: showSelectedStats ? "Selected Songs Duration" : "Total Duration",
		count,
	};
}
