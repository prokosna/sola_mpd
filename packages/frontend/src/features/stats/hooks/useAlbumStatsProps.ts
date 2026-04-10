import {
	type Song,
	Song_MetadataTag,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { useAtomValue } from "jotai";
import { useMemo } from "react";

import type { CardStatsNumberProps } from "../components/CardStatsNumber";
import { getMetadataValueCountDistinct } from "../functions/statsCalculation";
import { statsAtom } from "../states/atoms/statsAtom";

export function useAlbumStatsProps(
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
				Song_MetadataTag.ALBUM,
			);
		}
		return stats.albumsCount;
	}, [showSelectedStats, selectedSongs, stats]);

	return {
		isSelected: showSelectedStats,
		label: showSelectedStats ? "Albums of Selected Songs" : "Total Albums",
		count,
	};
}
