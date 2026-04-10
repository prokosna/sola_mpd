import {
	type Song,
	Song_MetadataTag,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { useAtomValue } from "jotai";
import { useMemo } from "react";

import type { CardStatsNumberProps } from "../components/CardStatsNumber";
import { getMetadataValueCountDistinct } from "../functions/statsCalculation";
import { statsAtom } from "../states/atoms/statsAtom";

export function useArtistStatsProps(
	showSelectedStats: boolean,
	selectedSongs: Song[],
): CardStatsNumberProps {
	const stats = useAtomValue(statsAtom);

	const count = useMemo(() => {
		if (stats === undefined) {
			return undefined;
		}
		if (showSelectedStats) {
			return getMetadataValueCountDistinct(
				selectedSongs,
				Song_MetadataTag.ARTIST,
			);
		}
		return stats.artistsCount;
	}, [showSelectedStats, selectedSongs, stats]);

	return {
		isSelected: showSelectedStats,
		label: showSelectedStats ? "Artists of Selected Songs" : "Total Artists",
		count,
	};
}
