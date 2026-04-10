import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { useAtomValue } from "jotai";
import { useMemo } from "react";

import type { CardStatsNumberProps } from "../components/CardStatsNumber";
import { statsAtom } from "../states/atoms/statsAtom";

export function useSongStatsProps(
	showSelectedStats: boolean,
	selectedSongs: Song[],
): CardStatsNumberProps {
	const stats = useAtomValue(statsAtom);

	const count = useMemo(() => {
		if (stats === undefined) {
			return undefined;
		}
		if (showSelectedStats) {
			return selectedSongs.length;
		}
		return stats.songsCount;
	}, [showSelectedStats, selectedSongs.length, stats]);

	return {
		isSelected: showSelectedStats,
		label: showSelectedStats ? "Selected Songs" : "Total Songs",
		count,
	};
}
